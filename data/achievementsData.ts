
import { Achievement } from '../types';

export const achievementsData: Achievement[] = [
    {
        id: 'MASTERY_1',
        name: 'Erster Schritt',
        description: 'Meistern Sie Ihre erste Lernkarte (Stufe 5).',
        icon: 'star',
        criteria: { type: 'masteredCards', value: 1 },
    },
    {
        id: 'MASTERY_20',
        name: 'Fundament-Meister',
        description: 'Meistern Sie 20 Lernkarten.',
        icon: 'star',
        criteria: { type: 'masteredCards', value: 20 },
    },
    {
        id: 'QUIZ_1',
        name: 'Prüfling',
        description: 'Schließen Sie Ihr erstes Multiple-Choice-Quiz ab.',
        icon: 'list',
        criteria: { type: 'quizzesCompleted', value: 1 },
    },
    {
        id: 'QUIZ_5',
        name: 'Quiz-Champion',
        description: 'Schließen Sie 5 Multiple-Choice-Quizze ab.',
        icon: 'list',
        criteria: { type: 'quizzesCompleted', value: 5 },
    },
    {
        id: 'EXAM_1',
        name: 'Prüfungs-Veteran',
        description: 'Schließen Sie Ihre erste Fachgespräch-Simulation ab.',
        icon: 'exam',
        criteria: { type: 'examsCompleted', value: 1 },
    },
    {
        id: 'STREAK_7',
        name: 'Eiserner Wille',
        description: 'Erreichen Sie einen 7-Tage-Lern-Streak.',
        icon: 'fire',
        criteria: { type: 'streak', value: 7 },
    },
    {
        id: 'STREAK_30',
        name: 'Meister der Gewohnheit',
        description: 'Erreichen Sie einen 30-Tage-Lern-Streak.',
        icon: 'fire',
        criteria: { type: 'streak', value: 30 },
    },
    {
        id: 'ARCHITECT_1',
        name: 'Wissens-Sammler',
        description: 'Fügen Sie Ihren ersten eigenen Eintrag zur Bibliothek hinzu.',
        icon: 'book',
        criteria: { type: 'userContentAdded', value: 1 },
    },
     {
        id: 'ARCHITECT_10',
        name: 'Wissens-Architekt',
        description: 'Fügen Sie 10 eigene Einträge zur Bibliothek hinzu.',
        icon: 'book',
        criteria: { type: 'userContentAdded', value: 10 },
    },
];
