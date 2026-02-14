export interface Ingredient {
    _id: string;
    name: string;
    image?: string;
    unit?: string;
    category?: string;
    calories?: number;
    macros?: {
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
    };
    tags?: string[];
}

export interface UserRef {
    _id: string;
    name: string;
    email?: string;
}

export interface Recipe {
    _id: string;
    title: string;
    description: string;
    time: string;
    matchPercentage?: number;
    image?: string;
    ingredients?: any[];
    category?: string;
    steps?: string[];
    user?: string;
    difficulty?: string;
    isPublic?: boolean;
    tags?: string[];
}

export interface RecipeRef {
    _id: string;
    title: string;
    time?: string;
    imageUrl?: string;
}

export interface Meal {
    _id?: string;
    type: 'desayuno' | 'almuerzo' | 'cena' | 'snack' | string;
    recipe: RecipeRef | { _id: string; title: string };
}

export interface DayPlan {
    _id?: string;
    day: string;
    meals: Meal[];
}

export interface MealPlan {
    _id: string;
    title: string;
    description?: string;
    user?: string | UserRef;
    days: DayPlan[];
    isActive?: boolean;
    isPublic?: boolean;
    isSystem?: boolean;
    image?: string;
    createdAt?: string;
    ownerId?: string;
    owner?: any;
}

export interface ShoppingListItem {
    _id: string;
    ingredient: {
        _id: string;
        name: string;
        unit?: string;
        category?: string;
    } | string; // Handle populated vs ID
    quantity: number;
    unit?: string;
    checked: boolean;
    contributors?: {
        recipeTitle: string;
        quantity: number;
        unit?: string;
    }[];
}

export interface PantryItem {
    _id: string;
    ingredient: {
        _id: string;
        name: string;
        unit?: string;
        category?: string;
        image?: string;
    } | string;
    quantity?: number;
    unit?: string;
    stockLevel?: 'FULL' | 'MEDIUM' | 'LOW' | 'OUT';
}
