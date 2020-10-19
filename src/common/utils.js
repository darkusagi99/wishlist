
import React from 'react'

// Calcul de l'identifiant de la date
export const getDayId = (date) => {
    return date.getFullYear() + "-" + date.getMonth() + '-' + date.getDate();
}

    // Affichage de la date formattée
export const displayFormatedTime = (date) => {
    var dateToFormat = new Date(date.seconds*1000)
    return dateToFormat.getHours() + ":" + dateToFormat.getMinutes().toString().padStart(2,0);
}

// Affichage de l'heure formattée
export const displayFormatedDate = (date) => {
    var dateToFormat = new Date(date.seconds*1000)
    return dateToFormat.toLocaleDateString("fr-FR");
}

// Affichage d'une cellule de rapport



// Affichage d'un total mensuel


