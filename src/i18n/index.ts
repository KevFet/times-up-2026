import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    fr: {
        translation: {
            "rules": "Règles",
            "start_game": "Commencer",
            "phase1_title": "Phase 1 : Paroles libres",
            "phase2_title": "Phase 2 : Un seul mot",
            "phase3_title": "Phase 3 : Mime & Bruitage",
            "next_turn": "C'est au tour de l'équipe suivante !",
            "skip": "Passer",
            "got_it": "Trouvé !",
            "rules_text": "Phase 1 : Décrivez la célébrité sans prononcer son nom. Pas de limite de mots.\nPhase 2 : Un seul mot pour faire deviner.\nPhase 3 : Mimes et bruitages uniquement.\n\n40 cartes au total.",
            "score": "Score",
            "team": "Équipe",
            "time_up": "Temps écoulé !",
            "setup_title": "Préparation",
            "discard_instructions": "Chaque joueur reçoit des cartes. Jetez-en 2 pour n'en garder que 40 au total."
        }
    },
    en: {
        translation: {
            "rules": "Rules",
            "start_game": "Start Game",
            "phase1_title": "Phase 1: Free Speech",
            "phase2_title": "Phase 2: One Word",
            "phase3_title": "Phase 3: Mime & Sound",
            "next_turn": "Next team's turn!",
            "skip": "Skip",
            "got_it": "Got it!",
            "rules_text": "Phase 1: Describe the celebrity without saying their name. Unlimited words.\nPhase 2: Use only one word.\nPhase 3: Mimes and sounds only.\n\n40 cards total.",
            "score": "Score",
            "team": "Team",
            "time_up": "Time's up!",
            "setup_title": "Setup",
            "discard_instructions": "Each player receives cards. Discard 2 to keep a total of 40 cards."
        }
    },
    es_mx: {
        translation: {
            "rules": "Reglas",
            "start_game": "Empezar Juego",
            "phase1_title": "Fase 1: Palabra libre",
            "phase2_title": "Fase 2: Una sola palabra",
            "phase3_title": "Fase 3: Mímica y sonidos",
            "next_turn": "¡Turno del siguiente equipo!",
            "skip": "Pasar",
            "got_it": "¡Lo tengo!",
            "rules_text": "Fase 1: Describe a la celebridad sin decir su nombre. Palabras ilimitadas.\nFase 2: Solo una palabra.\nFase 3: Solo mímica y sonidos.\n\n40 cartas en total.",
            "score": "Puntuación",
            "team": "Equipo",
            "time_up": "¡Tiempo agotado!",
            "setup_title": "Configuración",
            "discard_instructions": "Cada jugador recibe cartas. Descarta 2 para mantener 40 cartas en total."
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "fr",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
