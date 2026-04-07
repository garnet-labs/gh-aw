package workflow

import (
	"github.com/github/gh-aw/pkg/logger"
)

var containerCacheLog = logger.New("workflow:container_cache")

// ContainerCacheEntry represents a cached container image digest resolution.
type ContainerCacheEntry struct {
	Image   string `json:"image"`            // Registry and repository, e.g. "ghcr.io/github/github-mcp-server"
	Version string `json:"version"`          // Tag or version, e.g. "v0.32.0"
	Digest  string `json:"digest"`           // Content digest, e.g. "sha256:abc123..."
	Source  string `json:"source,omitempty"` // Origin registry (for informational use)
}

// ContainerCache is a thin view over an ActionCache that exposes only the
// container-image digest operations.  Container entries are stored in the
// "containers" section of .github/aw/actions-lock.json alongside GitHub
// Actions pin entries.
type ContainerCache struct {
	ac *ActionCache
}

// NewContainerCache creates a ContainerCache backed by the actions-lock.json
// file in repoRoot.  Callers should call Load() before use.
func NewContainerCache(repoRoot string) *ContainerCache {
	return &ContainerCache{ac: NewActionCache(repoRoot)}
}

// NewContainerCacheFromActionCache wraps an existing ActionCache so that the
// compiler can reuse the cache it already loaded (avoiding a second disk read).
func NewContainerCacheFromActionCache(ac *ActionCache) *ContainerCache {
	return &ContainerCache{ac: ac}
}

// Load loads the underlying actions-lock.json from disk.
// A missing file is not an error.
func (c *ContainerCache) Load() error {
	return c.ac.Load()
}

// Save writes the underlying actions-lock.json to disk.
func (c *ContainerCache) Save() error {
	return c.ac.Save()
}

// GetDigest returns the SHA-256 digest for the given full image reference (e.g. "node:22-alpine").
// Returns empty string when no cached digest is available.
// c may be nil (callers that pass an optional cache use nil to mean "no cache").
func (c *ContainerCache) GetDigest(imageRef string) string {
	if c == nil || c.ac == nil {
		// c.ac is non-nil after construction via NewContainerCache or
		// NewContainerCacheFromActionCache; the nil guard is for callers that
		// pass an optional *ContainerCache and may pass nil.
		return ""
	}
	digest := c.ac.GetContainerDigest(imageRef)
	if digest != "" {
		containerCacheLog.Printf("Container cache hit for %s -> %s", imageRef, digest[:min(16, len(digest))])
	} else {
		containerCacheLog.Printf("Container cache miss for %s", imageRef)
	}
	return digest
}

// GetEntry returns the ContainerCacheEntry for the given full image reference.
// The zero value is returned when no entry exists.
func (c *ContainerCache) GetEntry(imageRef string) ContainerCacheEntry {
	if c == nil || c.ac == nil || c.ac.Containers == nil {
		return ContainerCacheEntry{}
	}
	return c.ac.Containers[imageRef]
}

// Set stores a digest entry.  The key is the full image reference "image:version".
func (c *ContainerCache) Set(imageRef, image, version, digest, source string) {
	c.ac.SetContainer(imageRef, image, version, digest, source)
	containerCacheLog.Printf("Set container cache entry: %s -> %s", imageRef, digest)
}

// GetCachePath returns the file path of the underlying cache file.
func (c *ContainerCache) GetCachePath() string {
	return c.ac.GetCachePath()
}

// lookupContainerDigest returns the pinned image reference for the given full image reference.
// If the cache has a digest for the reference, returns "image:tag@sha256:...", otherwise "image:tag".
func lookupContainerDigest(imageRef string, cache *ContainerCache) string {
	if cache == nil {
		return imageRef
	}
	digest := cache.GetDigest(imageRef)
	if digest == "" {
		return imageRef
	}
	return imageRef + "@" + digest
}
