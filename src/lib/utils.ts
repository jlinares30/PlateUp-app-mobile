export const normalizeTags = (tags: any[]): string[] => {
    if (!Array.isArray(tags)) return [];

    return tags.flatMap(tag => {
        try {
            // Check if the tag is a string representation of an array matches ["..."]
            if (typeof tag === 'string' && tag.trim().startsWith('[') && tag.trim().endsWith(']')) {
                const parsed = JSON.parse(tag);
                if (Array.isArray(parsed)) {
                    // Recursively normalize just in case
                    return normalizeTags(parsed);
                }
            }
            return tag;
        } catch (e) {
            return tag;
        }
    }).filter(t => typeof t === 'string' && t.trim().length > 0);
};
