import { usePreferencesStore } from '../store/usePreferencesStore';

const translations = {
    en: {
        common: {
            cancel: "Cancel",
            save: "Save",
            delete: "Delete",
            edit: "Edit",
            add: "Add",
            search: "Search...",
            loading: "Loading...",
            soon: "Soon",
            all: "All",
        },
        settings: {
            title: "Settings",
            generalSection: "Preferences",
            language: "Language",
            languageDesc: "App display language",
            units: "Measurement Units",
            unitsDesc: "Used in recipes & ingredients",
            metric: "Metric (kg, g, ml)",
            imperial: "Imperial (lbs, oz, fl oz)",
            theme: "Appearance",
            themeDesc: "Color scheme of the application",
            system: "System Default",
            light: "Light",
            dark: "Dark",
            accountSection: "Account & Security",
            editProfile: "Edit Profile",
            editProfileDesc: "Name, email & profile photo",
            resetPassword: "Change Password",
            resetPasswordDesc: "Update account password",
            aboutSection: "About & Information",
            version: "Version",
            developer: "Developer",
            sessionSection: "Session",
            logOut: "Log Out",
            logOutConfirmTitle: "Log Out",
            logOutConfirmMessage: "Are you sure you want to log out of PlateUp?",
        },
        sidebar: {
            home: "Home",
            recipes: "Recipes",
            mealPlans: "Meal Plans",
            shoppingList: "Shopping List",
            inventory: "Inventory",
            pantry: "Pantry",
            ingredients: "Ingredients",
            profile: "Profile",
            settings: "Settings",
            unitConverter: "Unit Converter",
            logOut: "Log Out",
            soon: "Soon",
        },
        dashboard: {
            welcome: "Welcome back,",
            subtitle: "What are we cooking today?",
            menu: "Dashboard",
            savedRecipes: "Saved Recipes",
            mealPlans: "Meal Plans",
            pantryItems: "Pantry Items",
            shoppingList: "Shopping List",
            exploreCategories: "Explore Categories",
            quickIdeas: "Quick Meal Ideas",
            pantryOverview: "Pantry Overview",
            viewAll: "View All",
        },
        recipes: {
            title: "Recipe List",
            myCollection: "My Recipe Collection",
            myRecipes: "My Recipes",
            favorites: "Favorites",
            filterIngredients: "Filter by Ingredients",
            typeIngredient: "Type an ingredient...",
            searchTitle: "Search recipe title...",
            noRecipesFound: "No recipes found for this category.",
            noMyRecipes: "No recipes created yet.",
            noFavorites: "No favorite recipes saved yet.",
            createRecipe: "Create Recipe",
            newRecipeTitle: "New Recipe",
            editRecipeTitle: "Edit Recipe",
            coverPhoto: "Add Cover Photo",
            recipeTitleLabel: "Title *",
            recipeTitlePlaceholder: "e.g. Garlic Butter Salmon",
            prepTimeLabel: "Prep Time",
            prepTimePlaceholder: "e.g. 25 min",
            servingsLabel: "Servings",
            servingsPlaceholder: "e.g. 4",
            categoryLabel: "Category",
            ingredientsSection: "Ingredients",
            addIngredient: "Add Ingredient",
            instructionsSection: "Steps & Instructions",
            addStep: "Add Step",
            stepPlaceholder: "Describe this step...",
            categories: {
                All: "All",
                Breakfast: "Breakfast",
                Lunch: "Lunch",
                Dinner: "Dinner",
                Snack: "Snack",
                Dessert: "Dessert",
                Drink: "Drink",
            }
        },
        mealplans: {
            title: "Meal Plans",
            publicPlans: "Public Plans",
            myPlans: "My Plans",
            noPlansFound: "No meal plans found.",
            createPlan: "Create Plan",
            newPlanTitle: "New Meal Plan",
            editPlanTitle: "Edit Meal Plan",
            coverPhoto: "Add Cover Photo",
            planTitleLabel: "Title *",
            planTitlePlaceholder: "e.g. Weekly Healthy Mix",
            planDescLabel: "Description",
            planDescPlaceholder: "What's this plan about?",
            activePlanLabel: "Active Plan",
            activePlanSublabel: "Set as your current plan",
            publicPlanLabel: "Public Plan",
            publicPlanSublabel: "Allow others to see this plan",
            daysAndMeals: "Days & Meals",
            dayNamePlaceholder: "Day Name",
            addMeal: "Add Meal",
            addDay: "Add Day",
            createButton: "Create",
            saveButton: "Save Changes",
        },
        shopping: {
            title: "Shopping List",
            addToPantry: "Move to Pantry",
            clearAll: "Clear All",
            emptyTitle: "Your shopping list is empty",
            emptySubtitle: "Add ingredients from recipes to start your list.",
            exploreRecipes: "Explore Recipes",
        },
        pantry: {
            title: "Pantry Inventory",
            searchPlaceholder: "Search in pantry...",
            emptyTitle: "Your pantry is empty",
            emptySubtitle: "Add items to track your ingredients.",
            addItem: "Add Item",
            stockFull: "Full",
            stockMedium: "Medium",
            stockLow: "Low",
        },
        profile: {
            title: "User Profile",
            personalInfo: "Personal Details",
            name: "Name",
            email: "Email",
            newPassword: "New Password",
            confirmPassword: "Confirm Password",
            saveChanges: "Save Changes",
        }
    },
    es: {
        common: {
            cancel: "Cancelar",
            save: "Guardar",
            delete: "Eliminar",
            edit: "Editar",
            add: "Agregar",
            search: "Buscar...",
            loading: "Cargando...",
            soon: "Pronto",
            all: "Todos",
        },
        settings: {
            title: "Ajustes",
            generalSection: "Preferencias",
            language: "Idioma",
            languageDesc: "Idioma de la aplicación",
            units: "Unidades de Medida",
            unitsDesc: "Usado en recetas e ingredientes",
            metric: "Métrico (kg, g, ml)",
            imperial: "Imperial (lbs, oz, fl oz)",
            theme: "Apariencia",
            themeDesc: "Esquema de colores de la aplicación",
            system: "Por defecto (sistema)",
            light: "Claro",
            dark: "Oscuro",
            accountSection: "Cuenta y Seguridad",
            editProfile: "Editar Perfil",
            editProfileDesc: "Nombre, correo y foto de perfil",
            resetPassword: "Cambiar Contraseña",
            resetPasswordDesc: "Actualizar clave de la cuenta",
            aboutSection: "Acerca de la App",
            version: "Versión",
            developer: "Desarrollador",
            sessionSection: "Sesión",
            logOut: "Cerrar Sesión",
            logOutConfirmTitle: "Cerrar Sesión",
            logOutConfirmMessage: "¿Estás seguro de que deseas cerrar sesión en PlateUp?",
        },
        sidebar: {
            home: "Inicio",
            recipes: "Recetas",
            mealPlans: "Planes de Comida",
            shoppingList: "Lista de Compras",
            inventory: "Inventario",
            pantry: "Despensa",
            ingredients: "Ingredientes",
            profile: "Perfil",
            settings: "Ajustes",
            unitConverter: "Conversor",
            logOut: "Cerrar Sesión",
            soon: "Pronto",
        },
        dashboard: {
            welcome: "Bienvenido de nuevo,",
            subtitle: "¿Qué cocinaremos hoy?",
            menu: "Menú Principal",
            savedRecipes: "Recetas Guardadas",
            mealPlans: "Planes de Comida",
            pantryItems: "En la Despensa",
            shoppingList: "Lista de Compras",
            exploreCategories: "Explorar Categorías",
            quickIdeas: "Ideas Rápidas de Comidas",
            pantryOverview: "Mi Despensa",
            viewAll: "Ver Todo",
        },
        recipes: {
            title: "Lista de Recetas",
            myCollection: "Mi Colección de Recetas",
            myRecipes: "Mis Recetas",
            favorites: "Favoritos",
            filterIngredients: "Filtrar por Ingredientes",
            typeIngredient: "Escribe un ingrediente...",
            searchTitle: "Buscar título de receta...",
            noRecipesFound: "No se encontraron recetas para esta categoría.",
            noMyRecipes: "Aún no has creado recetas.",
            noFavorites: "Aún no tienes recetas favoritas guardadas.",
            createRecipe: "Crear Receta",
            newRecipeTitle: "Nueva Receta",
            editRecipeTitle: "Editar Receta",
            coverPhoto: "Agregar Foto de Portada",
            recipeTitleLabel: "Título *",
            recipeTitlePlaceholder: "Ej. Salmón al Ajillo",
            prepTimeLabel: "Tiempo de Preparación",
            prepTimePlaceholder: "Ej. 25 min",
            servingsLabel: "Porciones",
            servingsPlaceholder: "Ej. 4",
            categoryLabel: "Categoría",
            ingredientsSection: "Ingredientes",
            addIngredient: "Agregar Ingrediente",
            instructionsSection: "Pasos e Instrucciones",
            addStep: "Agregar Paso",
            stepPlaceholder: "Describe este paso...",
            categories: {
                All: "Todos",
                Breakfast: "Desayuno",
                Lunch: "Almuerzo",
                Dinner: "Cena",
                Snack: "Snack",
                Dessert: "Postre",
                Drink: "Bebida",
            }
        },
        mealplans: {
            title: "Planes de Comida",
            publicPlans: "Planes Públicos",
            myPlans: "Mis Planes",
            noPlansFound: "No se encontraron planes de comida.",
            createPlan: "Crear Plan",
            newPlanTitle: "Nuevo Plan de Comidas",
            editPlanTitle: "Editar Plan",
            coverPhoto: "Agregar Foto de Portada",
            planTitleLabel: "Título *",
            planTitlePlaceholder: "Ej. Menú Semanal Saludable",
            planDescLabel: "Descripción",
            planDescPlaceholder: "¿De qué trata este plan?",
            activePlanLabel: "Plan Activo",
            activePlanSublabel: "Establecer como tu plan actual",
            publicPlanLabel: "Plan Público",
            publicPlanSublabel: "Permitir que otros vean este plan",
            daysAndMeals: "Días y Comidas",
            dayNamePlaceholder: "Nombre del Día",
            addMeal: "Agregar Comida",
            addDay: "Agregar Día",
            createButton: "Crear",
            saveButton: "Guardar",
        },
        shopping: {
            title: "Lista de Compras",
            addToPantry: "Mover a Despensa",
            clearAll: "Limpiar Todo",
            emptyTitle: "Tu lista de compras está vacía",
            emptySubtitle: "Agrega ingredientes desde las recetas para comenzar tu lista.",
            exploreRecipes: "Explorar Recetas",
        },
        pantry: {
            title: "Inventario de Despensa",
            searchPlaceholder: "Buscar en despensa...",
            emptyTitle: "Tu despensa está vacía",
            emptySubtitle: "Agrega elementos para hacer seguimiento a tus ingredientes.",
            addItem: "Agregar Elemento",
            stockFull: "Lleno",
            stockMedium: "Medio",
            stockLow: "Bajo",
        },
        profile: {
            title: "Perfil de Usuario",
            personalInfo: "Datos Personales",
            name: "Nombre",
            email: "Correo Electrónico",
            newPassword: "Nueva Contraseña",
            confirmPassword: "Confirmar Contraseña",
            saveChanges: "Guardar Cambios",
        }
    }
};

export type TranslationKey =
    | "common.cancel"
    | "common.save"
    | "common.delete"
    | "common.edit"
    | "common.add"
    | "common.search"
    | "common.loading"
    | "common.soon"
    | "common.all"
    | "settings.title"
    | "settings.generalSection"
    | "settings.language"
    | "settings.languageDesc"
    | "settings.units"
    | "settings.unitsDesc"
    | "settings.metric"
    | "settings.imperial"
    | "settings.theme"
    | "settings.themeDesc"
    | "settings.system"
    | "settings.light"
    | "settings.dark"
    | "settings.accountSection"
    | "settings.editProfile"
    | "settings.editProfileDesc"
    | "settings.resetPassword"
    | "settings.resetPasswordDesc"
    | "settings.aboutSection"
    | "settings.version"
    | "settings.developer"
    | "settings.sessionSection"
    | "settings.logOut"
    | "settings.logOutConfirmTitle"
    | "settings.logOutConfirmMessage"
    | "sidebar.home"
    | "sidebar.recipes"
    | "sidebar.mealPlans"
    | "sidebar.shoppingList"
    | "sidebar.inventory"
    | "sidebar.pantry"
    | "sidebar.ingredients"
    | "sidebar.profile"
    | "sidebar.settings"
    | "sidebar.unitConverter"
    | "sidebar.logOut"
    | "sidebar.soon"
    | "dashboard.welcome"
    | "dashboard.subtitle"
    | "dashboard.menu"
    | "dashboard.savedRecipes"
    | "dashboard.mealPlans"
    | "dashboard.pantryItems"
    | "dashboard.shoppingList"
    | "dashboard.exploreCategories"
    | "dashboard.quickIdeas"
    | "dashboard.pantryOverview"
    | "dashboard.viewAll"
    | "recipes.title"
    | "recipes.myCollection"
    | "recipes.myRecipes"
    | "recipes.favorites"
    | "recipes.filterIngredients"
    | "recipes.typeIngredient"
    | "recipes.searchTitle"
    | "recipes.noRecipesFound"
    | "recipes.noMyRecipes"
    | "recipes.noFavorites"
    | "recipes.createRecipe"
    | "recipes.newRecipeTitle"
    | "recipes.editRecipeTitle"
    | "recipes.coverPhoto"
    | "recipes.recipeTitleLabel"
    | "recipes.recipeTitlePlaceholder"
    | "recipes.prepTimeLabel"
    | "recipes.prepTimePlaceholder"
    | "recipes.servingsLabel"
    | "recipes.servingsPlaceholder"
    | "recipes.categoryLabel"
    | "recipes.ingredientsSection"
    | "recipes.addIngredient"
    | "recipes.instructionsSection"
    | "recipes.addStep"
    | "recipes.stepPlaceholder"
    | "mealplans.title"
    | "mealplans.publicPlans"
    | "mealplans.myPlans"
    | "mealplans.noPlansFound"
    | "mealplans.createPlan"
    | "mealplans.newPlanTitle"
    | "mealplans.editPlanTitle"
    | "mealplans.coverPhoto"
    | "mealplans.planTitleLabel"
    | "mealplans.planTitlePlaceholder"
    | "mealplans.planDescLabel"
    | "mealplans.planDescPlaceholder"
    | "mealplans.activePlanLabel"
    | "mealplans.activePlanSublabel"
    | "mealplans.publicPlanLabel"
    | "mealplans.publicPlanSublabel"
    | "mealplans.daysAndMeals"
    | "mealplans.dayNamePlaceholder"
    | "mealplans.addMeal"
    | "mealplans.addDay"
    | "mealplans.createButton"
    | "mealplans.saveButton"
    | "shopping.title"
    | "shopping.addToPantry"
    | "shopping.clearAll"
    | "shopping.emptyTitle"
    | "shopping.emptySubtitle"
    | "shopping.exploreRecipes"
    | "pantry.title"
    | "pantry.searchPlaceholder"
    | "pantry.emptyTitle"
    | "pantry.emptySubtitle"
    | "pantry.addItem"
    | "pantry.stockFull"
    | "pantry.stockMedium"
    | "pantry.stockLow"
    | "profile.title"
    | "profile.personalInfo"
    | "profile.name"
    | "profile.email"
    | "profile.newPassword"
    | "profile.confirmPassword"
    | "profile.saveChanges";

export function useTranslation() {
    const language = usePreferencesStore((state) => state.language);

    const t = (key: TranslationKey, params?: Record<string, string>): string => {
        const parts = key.split('.');
        let current: any = translations[language] || translations.en;
        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                let fallback: any = translations.en;
                for (const p of parts) {
                    if (fallback && fallback[p] !== undefined) {
                        fallback = fallback[p];
                    }
                }
                current = typeof fallback === 'string' ? fallback : key;
                break;
            }
        }

        let result = typeof current === 'string' ? current : key;
        if (params) {
            Object.keys(params).forEach((paramKey) => {
                result = result.replace(`{${paramKey}}`, params[paramKey]);
            });
        }
        return result;
    };

    return { t, language };
}
