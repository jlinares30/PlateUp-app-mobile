export interface UserRef {
    _id: string;
    name: string;
    email?: string;
}

export interface RecipeRef {
    _id: string;
    title: string;
    time?: string;
    imageUrl?: string;
}

export interface Meal {
    _id: string;
    type: string;
    recipe: RecipeRef | { _id: string; title: string };
}

export interface DayPlan {
    _id: string;
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
    imageUrl?: string;
    createdAt?: string;

    // Optional properties for UI handling
    ownerId?: string;
    owner?: any;
    // Using loose type for compatibility or strictly enforcing it
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
}
