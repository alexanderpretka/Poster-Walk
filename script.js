
// ============================================
// GOOGLE APPS SCRIPT CONNECTION
// ============================================

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzV6CqiSl8S2Obfc577IgR8tmktHpamabgmAQA20CGRBnuCDZl4T8nmWIqrqX9d3jsghQ/exec";


// ============================================
// SCORE CALCULATIONS
// ============================================

const form = document.getElementById("evaluationForm");

function getScores() {
    const scores = [];

    for (let i = 0; i < 7; i++) {
        const selected = form.querySelector(
            `input[name="score${i}"]:checked`
        );

        scores.push(selected ? Number(selected.value) : 0);
    }

    return scores;
}

function updateScores() {
    const scores = getScores();

    const posterScore = scores
        .slice(0, 5)
        .reduce((total, score) => total + score, 0);

    const presentationScore = scores
        .slice(5, 7)
        .reduce((total, score) => total + score, 0);

    const totalScore = posterScore + presentationScore;

    document.getElementById("posterScore").textContent =
        `${posterScore} / 20`;

    document.getElementById("presentationScore").textContent =
        `${presentationScore} / 8`;

    document.getElementById("totalScore").textContent =
        `${totalScore} / 28`;
}


// Update totals whenever a rating changes.
form.addEventListener("change", updateScores);


// ============================================
// FORM SUBMISSION
// ============================================

form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const statusMessage =
        document.getElementById("statusMessage");

    const submitButton =
        document.getElementById("submitButton");

    if (!form.reportValidity()) {
        return;
    }

    const scores = getScores();

    if (scores.some(score => score < 1 || score > 4)) {
        statusMessage.textContent =
            "Please select a score for all seven criteria.";
        return;
    }

    // Prepare the evaluation data.
    const evaluationData = {
        evaluator: document.getElementById("evaluator").value.trim(),

        ambassador: document.getElementById("ambassador").value,

        topic: document.getElementById("topic").value.trim(),

        scores: scores,

        strengths: document.getElementById("strengths").value.trim(),

        growth: document.getElementById("growth").value.trim(),

        comments: document.getElementById("comments").value.trim()
    };

    submitButton.disabled = true;

    statusMessage.textContent = "Sending your evaluation...";

    try {

        /*
          The text/plain request avoids a CORS preflight.
          no-cors means the browser cannot read Google's response.
          The request resolving does not prove the spreadsheet saved it.
        */

        await fetch(SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=UTF-8"
            },
            body: JSON.stringify(evaluationData)
        });

        // Show a sent message, not a verified-save message.
        form.classList.add("hidden");

        document.querySelector(".intro").classList.add("hidden");

        document.getElementById("confirmation")
            .classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        statusMessage.textContent =
            "Unable to send the evaluation. Please check your internet connection and try again.";

        submitButton.disabled = false;

        console.error("Submission error:", error);
    }
});


// ============================================
// SUBMIT ANOTHER EVALUATION
// ============================================

document.getElementById("newEvaluation")
    .addEventListener("click", function() {

        form.reset();

        updateScores();

        form.classList.remove("hidden");

        document.querySelector(".intro")
            .classList.remove("hidden");

        document.getElementById("confirmation")
            .classList.add("hidden");

        document.getElementById("submitButton").disabled = false;

        document.getElementById("statusMessage").textContent = "";

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });


// Initialize the score display.
updateScores();