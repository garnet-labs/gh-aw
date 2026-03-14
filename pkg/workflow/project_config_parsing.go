package workflow

import "github.com/github/gh-aw/pkg/logger"

// parseProjectViews parses the "views" list from a project config map.
// Only views with both name and layout fields are included; invalid ones are skipped.
func parseProjectViews(configMap map[string]any, log *logger.Logger) []ProjectView {
	viewsData, exists := configMap["views"]
	if !exists {
		return nil
	}
	viewsList, ok := viewsData.([]any)
	if !ok {
		return nil
	}

	var views []ProjectView
	for i, viewItem := range viewsList {
		viewMap, ok := viewItem.(map[string]any)
		if !ok {
			continue
		}
		view := ProjectView{
			Name:        extractStringFromMap(viewMap, "name", nil),
			Layout:      extractStringFromMap(viewMap, "layout", nil),
			Filter:      extractStringFromMap(viewMap, "filter", nil),
			Description: extractStringFromMap(viewMap, "description", nil),
		}

		// Parse visible-fields (optional)
		if visibleFields, exists := viewMap["visible-fields"]; exists {
			if fieldsList, ok := visibleFields.([]any); ok {
				for _, field := range fieldsList {
					if fieldInt, ok := field.(int); ok {
						view.VisibleFields = append(view.VisibleFields, fieldInt)
					}
				}
			}
		}

		// Only add view if it has required fields
		if view.Name != "" && view.Layout != "" {
			views = append(views, view)
			log.Printf("Parsed view %d: %s (%s)", i+1, view.Name, view.Layout)
		} else {
			log.Printf("Skipping invalid view %d: missing required fields", i+1)
		}
	}
	return views
}

// parseProjectFieldDefinitions parses the "field-definitions" (or "field_definitions") list
// from a project config map. Only fields with both name and data-type are included.
func parseProjectFieldDefinitions(configMap map[string]any, log *logger.Logger) []ProjectFieldDefinition {
	fieldsData, hasFields := configMap["field-definitions"]
	if !hasFields {
		// Allow underscore variant as well
		fieldsData, hasFields = configMap["field_definitions"]
	}
	if !hasFields {
		return nil
	}
	fieldsList, ok := fieldsData.([]any)
	if !ok {
		return nil
	}

	var fields []ProjectFieldDefinition
	for i, fieldItem := range fieldsList {
		fieldMap, ok := fieldItem.(map[string]any)
		if !ok {
			continue
		}

		field := ProjectFieldDefinition{
			Name:     extractStringFromMap(fieldMap, "name", nil),
			DataType: extractStringFromMap(fieldMap, "data-type", nil),
		}
		if field.DataType == "" {
			field.DataType = extractStringFromMap(fieldMap, "data_type", nil)
		}

		if options, exists := fieldMap["options"]; exists {
			if optionsList, ok := options.([]any); ok {
				for _, opt := range optionsList {
					if optStr, ok := opt.(string); ok {
						field.Options = append(field.Options, optStr)
					}
				}
			}
		}

		if field.Name != "" && field.DataType != "" {
			fields = append(fields, field)
			log.Printf("Parsed field definition %d: %s (%s)", i+1, field.Name, field.DataType)
		}
	}
	return fields
}
