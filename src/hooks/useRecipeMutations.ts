import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';
import api from "../lib/api";
import { Recipe } from "../types";

export const useRecipeMutations = () => {
  const queryClient = useQueryClient();
  const addAllMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
      // Fetch full recipe to get ingredients
      const res = await api.get(`/recipes/${recipe._id}`);
      const fullRecipe = res.data?.data ?? res.data;


      if (!fullRecipe.ingredients || fullRecipe.ingredients.length === 0) {
        throw new Error("No ingredients in recipe");
      }

      const itemsToAdd = fullRecipe.ingredients
        .map((ingObj: any) => {
          const ingData = typeof ingObj.ingredient === 'object' ? ingObj.ingredient : null;
          if (ingData) {
            let parsedQty = parseFloat(String(ingObj.quantity));

            // Stricter check: if it's NaN or not finite or <= 0, default to 1
            if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
              parsedQty = 1;
            }

            return {
              ingredientId: ingData._id,
              quantity: parsedQty,
              unit: ingObj.unit,
              recipeTitle: recipe.title
            };
          }
          return null;
        })
        .filter((i: any) => i !== null);



      if (itemsToAdd.length > 0) {
        await api.post("/shopping-list", itemsToAdd);
      }

      return itemsToAdd.length;
    },
    onSuccess: (count, variables) => {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Added ingredients from "${variables.title}" to list.`
      });
      queryClient.invalidateQueries({ queryKey: ['shoppingList'] });
    },
    onError: (err: any) => {
      Toast.show({
        type: 'info',
        text1: 'Info',
        text2: err.message === "No ingredients in recipe" ? err.message : "Could not add items."
      });
    }
  });

  return {
    addAllMutation: addAllMutation.data
  }
}