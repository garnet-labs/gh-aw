package workflow

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"

	"github.com/github/gh-aw/pkg/logger"
)

var containerCacheLog = logger.New("workflow:container_cache")

const (
	// ContainerCacheFileName is the name of the container lock file in .github/aw/.
	ContainerCacheFileName = "containers-lock.json"
)

// ContainerCacheEntry represents a cached container image digest resolution.
type ContainerCacheEntry struct {
	Image   string `json:"image"`            // Registry and repository, e.g. "ghcr.io/github/github-mcp-server"
	Version string `json:"version"`          // Tag or version, e.g. "v0.32.0"
	Digest  string `json:"digest"`           // Content digest, e.g. "sha256:abc123..."
	Source  string `json:"source,omitempty"` // Origin registry (for informational use)
}

// ContainerCache manages cached container image digest resolutions.
// Digests are stored in .github/aw/containers-lock.json and updated by
// the 'gh aw update' / 'gh aw upgrade' commands.
type ContainerCache struct {
	Entries map[string]ContainerCacheEntry `json:"entries"` // key: "image:version"
	path    string
	dirty   bool
}

// NewContainerCache creates a new container cache instance rooted at repoRoot.
// The cache file is stored at .github/aw/containers-lock.json relative to repoRoot.
func NewContainerCache(repoRoot string) *ContainerCache {
	cachePath := filepath.Join(repoRoot, ".github", "aw", ContainerCacheFileName)
	containerCacheLog.Printf("Creating container cache with path: %s", cachePath)
	return &ContainerCache{
		Entries: make(map[string]ContainerCacheEntry),
		path:    cachePath,
	}
}

// Load loads the cache from disk. Missing file is not an error.
func (c *ContainerCache) Load() error {
	containerCacheLog.Printf("Loading container cache from: %s", c.path)
	data, err := os.ReadFile(c.path)
	if err != nil {
		if os.IsNotExist(err) {
			containerCacheLog.Print("Container cache file does not exist, starting with empty cache")
			return nil
		}
		containerCacheLog.Printf("Failed to read container cache file: %v", err)
		return err
	}
	if err := json.Unmarshal(data, c); err != nil {
		containerCacheLog.Printf("Failed to unmarshal container cache data: %v", err)
		return err
	}
	c.dirty = false
	containerCacheLog.Printf("Successfully loaded container cache with %d entries", len(c.Entries))
	return nil
}

// Save writes the cache to disk with sorted entries.
// It is a no-op when the cache is clean (not modified).
func (c *ContainerCache) Save() error {
	if !c.dirty {
		containerCacheLog.Print("Container cache is clean, skipping save")
		return nil
	}
	containerCacheLog.Printf("Saving container cache to: %s with %d entries", c.path, len(c.Entries))

	if len(c.Entries) == 0 {
		containerCacheLog.Print("Container cache is empty, skipping file creation")
		if _, statErr := os.Stat(c.path); statErr == nil {
			if removeErr := os.Remove(c.path); removeErr != nil {
				return removeErr
			}
		}
		c.dirty = false
		return nil
	}

	if err := os.MkdirAll(filepath.Dir(c.path), 0755); err != nil {
		return err
	}

	data, err := c.marshalSorted()
	if err != nil {
		return err
	}
	data = append(data, '\n')

	if err := os.WriteFile(c.path, data, 0644); err != nil {
		return err
	}
	c.dirty = false
	containerCacheLog.Print("Successfully saved container cache")
	return nil
}

// marshalSorted marshals the cache with entries sorted by key for stable diffs.
func (c *ContainerCache) marshalSorted() ([]byte, error) {
	keys := make([]string, 0, len(c.Entries))
	for k := range c.Entries {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	var result []byte
	result = append(result, []byte("{\n  \"entries\": {\n")...)
	for i, key := range keys {
		entry := c.Entries[key]
		entryJSON, err := json.MarshalIndent(entry, "    ", "  ")
		if err != nil {
			return nil, err
		}
		result = append(result, []byte("    \""+key+"\": ")...)
		result = append(result, entryJSON...)
		if i < len(keys)-1 {
			result = append(result, ',')
		}
		result = append(result, '\n')
	}
	result = append(result, []byte("  }\n}")...)
	return result, nil
}

// GetDigest returns the SHA-256 digest for the given full image reference (e.g. "node:22-alpine").
// Returns empty string when no cached digest is available.
func (c *ContainerCache) GetDigest(imageRef string) string {
	if c == nil {
		return ""
	}
	entry, ok := c.Entries[imageRef]
	if !ok {
		containerCacheLog.Printf("Container cache miss for %s", imageRef)
		return ""
	}
	containerCacheLog.Printf("Container cache hit for %s -> %s", imageRef, entry.Digest[:min(16, len(entry.Digest))])
	return entry.Digest
}

// Set stores a digest entry. The key is the full image reference "image:version".
func (c *ContainerCache) Set(imageRef, image, version, digest, source string) {
	c.Entries[imageRef] = ContainerCacheEntry{
		Image:   image,
		Version: version,
		Digest:  digest,
		Source:  source,
	}
	c.dirty = true
	containerCacheLog.Printf("Set container cache entry: %s -> %s", imageRef, digest)
}

// GetCachePath returns the file path of the cache.
func (c *ContainerCache) GetCachePath() string {
	return c.path
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
