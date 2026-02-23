import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "slogan": "The game your mom warned you about.",
            "label_pseudo": "pseudo",
            "placeholder_pseudo": "Pseudo",
            "button_create": "Create",
            "label_code": "Code",
            "button_enter": "Create Room",
            "footer": "MADE WITH LOVE & A BIT OF AI 🇺🇸",
            "rules": "Rules",
            "start_game": "Start Game",
            "phase": "PHASE",
            "team": "TEAM",
            "time_up": "TIME'S UP!",
            "change": "CHANGE!",
            "next_turn": "NEXT TURN",
            "continue": "CONTINUE",
            "return_menu": "RETURN TO BASE",
            "finish": "ARENA CLEARED"
        }
    },
    fr: {
        translation: {
            "slogan": "Le jeu que ta daronne va détester.",
            "label_pseudo": "pseudo",
            "placeholder_pseudo": "Pseudo",
            "button_create": "Créer",
            "label_code": "Code",
            "button_enter": "Créer une Room",
            "footer": "FAIT AVEC AMOUR ET UN PEU D'IA 🇫🇷",
            "rules": "Règles",
            "start_game": "Commencer",
            "phase": "PHASE",
            "team": "ÉQUIPE",
            "time_up": "TEMPS ÉCOULÉ !",
            "change": "CHANGEMENT !",
            "next_turn": "PROCHAIN TOUR",
            "continue": "CONTINUER",
            "return_menu": "RETOUR AU MENU",
            "finish": "FIN DU JEU"
        }
    },
    es: {
        translation: {
            "slogan": "El juego que tus tías prohibirían.",
            "label_pseudo": "pseudo",
            "placeholder_pseudo": "Pseudo",
            "button_create": "Crear",
            "label_code": "Código",
            "button_enter": "Crear Sala",
            "footer": "HECHO CON PURA SAZÓN MEXA 🇲🇽",
            "rules": "Reglas",
            "start_game": "Empezar",
            "phase": "FASE",
            "team": "EQUIPO",
            "time_up": "¡TIEMPO AGOTADO!",
            "change": "¡CAMBIO!",
            "next_turn": "PRÓXIMO TURNO",
            "continue": "CONTINUAR",
            "return_menu": "VOLVER AL MENÚ",
            "finish": "FIN DEL JUEGO"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "en",
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
