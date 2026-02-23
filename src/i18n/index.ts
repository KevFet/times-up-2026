import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    fr: {
        translation: {
            "slogan": "Le jeu que ta daronne va détester.",
            "label_pseudo": "TON BLASE",
            "placeholder_pseudo": "Ex: Le King",
            "button_create": "+ CRÉER UNE ROOM",
            "separator": "OU REJOINS UNE PARTIE",
            "label_code": "CODE",
            "button_enter": "REJOINDRE",
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
    es_mx: {
        translation: {
            "slogan": "El juego que tus tías prohibirían.",
            "label_pseudo": "TU APODO",
            "placeholder_pseudo": "Ej. El Bicho",
            "button_create": "+ CREAR SALA",
            "separator": "O ÚNETE A UNA",
            "label_code": "CÓDIGO",
            "button_enter": "ENTRAR",
            "footer": "HECHO CON PURA SAZÓN MEXA 🇲🇽",
            "rules": "Reglas",
            "start_game": "Empezar",
            "phase": "FASE",
            "team": "EQUIPO",
            "time_up": "¡TIEMPO AGOTADO!",
            "change": "¡CAMBIO!",
            "next_turn": "PRÓXIMO TURNO",
            "continue": "CONTINUAR",
            "return_menu": "RETOUR AU MENU",
            "finish": "FIN DEL JUEGO"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "es_mx",
        fallbackLng: "es_mx",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
