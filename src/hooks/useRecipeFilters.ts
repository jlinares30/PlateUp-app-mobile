import { Ingredient } from '@/src/types';
import { useEffect, useState } from "react";


export const useRecipeFilters = () => {
    const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
    const [recipeQuery, setRecipeQuery] = useState<string>("");
    const [debouncedRecipeQuery, setDebouncedRecipeQuery] = useState<string>("");

    useEffect(() => {
        const handler = setTimeout(() => {
          setDebouncedRecipeQuery(recipeQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [recipeQuery]);

    const addIngredient = (ingredient: Ingredient) => {
        if (!selectedIngredients.some((i) => i._id === ingredient._id)) {
            setSelectedIngredients([...selectedIngredients, ingredient]);
        }
    };
    const removeIngredient = (id: string) => {
        setSelectedIngredients(selectedIngredients.filter((i) => i._id !== id));
    };

    return {
        selectedIngredients,
        recipeQuery,
        debouncedRecipeQuery,
        setRecipeQuery,
        addIngredient,
        removeIngredient,
    }

}

