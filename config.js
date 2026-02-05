import Constants from 'expo-constants';

// Detectamos si se está en desarrollo o en producción (EAS Update/Build)
const getApiUrl = () => {
    const host = Constants.expoConfig?.extra?.apiUrl;

    if (__DEV__) {
        // Ip local para cuando se pruebe con el celular físico
        return 'http://192.168.1.33:5001/api';
    }

    // En producción (EAS), usará la variable que se definirá en app.json
    return host || 'https://plateup-mobile-server.onrender.com/api';
};

export const API_URL = getApiUrl();