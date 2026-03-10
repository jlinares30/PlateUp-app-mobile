import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
import { Ingredient, Recipe } from "../types";

export const useRecipeQueries = (debouncedRecipeQuery: string, selectedIngredients: Ingredient[]) => {
    const ingredientsQuery = useQuery({
        queryKey: ["ingredients"],
        queryFn: async () => {
            const res = await api.get("/ingredients");
            const data = res.data?.data ?? res.data;
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const recipesQuery = useQuery({
        queryKey: ['recipes', selectedIngredients.map(i => i._id).sort().join(','), debouncedRecipeQuery],
        queryFn: async () => {
        let data: Recipe[] = [];

        if (selectedIngredients.length > 0) {
            // Fetch by ingredients
            const res = await api.post("/recipes/by-ingredients", {
            ingredientIds: selectedIngredients.map(i => i._id),
            });
            data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);

            // Client-side text filter
            if (debouncedRecipeQuery.trim()) {
            const lowerQ = debouncedRecipeQuery.toLowerCase();
            data = data.filter(r => r.title.toLowerCase().includes(lowerQ));
            }

            // Sort by match
            data.sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));

        } else {
            // Normal fetch
            const params = debouncedRecipeQuery.trim() ? { query: debouncedRecipeQuery.trim() } : {};
            const res = await api.get("/recipes", { params });
            data = res.data?.data ?? res.data;
            if (!Array.isArray(data)) data = [];
        }
        return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        ingredientsQuery: ingredientsQuery.data ?? [],
        recipesQuery: recipesQuery.data ?? [],
        isLoading: recipesQuery.isLoading,
        isRefetching: recipesQuery.isRefetching,
        refetch: recipesQuery.refetch,
        error: recipesQuery.error
    };
}