let currentQuestionIndex = 0; // Asetetaan currenQuestionIndeksi nollaan
let questions = []; // JavaScript-taulukoita talteen ottamista varten. Voivat sisältää useita arvoja
let userAnswers = []; // Käyttäjän vastaukset talteen

// Tämä osa on index.html-sivua varten:
if (window.location.pathname.includes("index.html")) {
    document.getElementById('start-button').addEventListener('click', () => {
        const selectedCategory = document.getElementById('category-select').value;
        window.location.href = `quiz.html?category=${selectedCategory}`;
    });
}

// "Pohja"/perusrakenne quiz.html-sivulle:
if (window.location.pathname.includes("quiz.html")) {
    const params = new URLSearchParams(window.location.search);
    const selectedCategory = params.get('category');
    const url = `https://opentdb.com/api.php?amount=10&category=${selectedCategory}&type=multiple`;

    axios.get(url) // Tekee HTTP GET -kutsun. Kysyy tietoja OTDB:stä
        .then(response => {
            questions = response.data.results;
            currentQuestionIndex = 0;
            userAnswers = []; // Nollaa käyttäjän vastaukset pelin alkaessa
            showQuestion(); // Kutsutaan shoQuestions-funktiota
        })
        .catch(error => {
            console.error('Virhe kysymysten haussa:', error);
        });
}

function showQuestion() {
    const quizContainer = document.getElementById('quiz-container'); // Tämä elementti toimii säiliönä, johon kysymykset ja vastaukset lisätään
    quizContainer.innerHTML = ''; // Tyhjentää aiemmat kysymykset

    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex]; // Haetaan nykyinen kysymys questions-taulukosta käyttäen currentQuestionIndex-muuttujaa
        const questionElement = document.createElement('div'); // Luodaan uusi div-elementti, joka tulee sisältämään kysymyksen ja siihen liittyvät vastaukset

        questionElement.innerHTML = `<h2>${question.question}</h2>`; // Kysymyksen teksti div-elementissä h2-otsikkona

        const answers = [...question.incorrect_answers, question.correct_answer]; // Luodaan uusi taulukko, joka sisältää vastaukset. Taulukko luodaan (...) levitysohjelmalla, joka yhdistää useita taulukkoja
        answers.sort(() => Math.random() - 0.5); // Sekoittaa vastausvaihtoehdot satunnaiseen järjestykseen

        answers.forEach(answer => { // Answers-taulukon sisäänrakennettu metodi, joka käy läpi taulukon jokaisen vastauksen
            const button = document.createElement('button'); // Luodaan uusi button-elementti
            button.innerHTML = answer; // Asetetaan sisällöksi nykyinen vastaus
            button.addEventListener('click', () => {
                checkAnswer(answer, button); // Napin klikkauksella kutsutaan checkAnswer-funktiota ja siirretään painike teksteineen argumentteina 
            });
            questionElement.appendChild(button); // Lisätään nappi kysymyselementtiin
        });

        quizContainer.appendChild(questionElement);
    } else {
        endQuiz(); // If-lauseen else-haara, joka lopettaa pelin, jos ehto ei enää täyty
    }
}

function checkAnswer(selectedAnswer, button) {
    const question = questions[currentQuestionIndex]; // Haetaan nykyinen kysymys questions-taulukosta indeksiä käyttäen
    userAnswers.push({ // Tallennetaan käyttäjän vastaus userAnswers-taulukkoon objektina
        question: question.question,
        selectedAnswer: selectedAnswer,
        correctAnswer: question.correct_answer
    });

    // Muutetaan painikkeen väri sen perusteella, onko vastaus oikein vai väärin
    if (selectedAnswer === question.correct_answer) {
        button.style.backgroundColor = 'green'; // Oikea vastaus niin vihreä
    } else {
        button.style.backgroundColor = 'red'; // Väärä vastaus niin punainen
        // Etsii oikean vastauksen ja muokkaa sen värin vihreäksi
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.innerHTML === question.correct_answer) {
                btn.style.backgroundColor = 'green'; // Oikea vastaus
            }
        });
    }

    currentQuestionIndex++; // Kasvatetaan indeksin arvoa yhdellä
    setTimeout(showQuestion, 1000); // Käytetään setTimeout-funktiota viivästyttämään showQuestion-funktion kutsua sekunnilla, jotta oikea vastaus ehtii näkyä
}

function endQuiz() { // Tekee yhteenvedon vastauksista ja näyttää lopputuloksen
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.style.display = 'none'; // Piilottaaa kysymys-osion

    const summaryContainer = document.getElementById('summary-container');
    summaryContainer.style.display = 'block'; // Näyttää yhteenveto-osion
    summaryContainer.innerHTML = '<h2>Summary</h2>'; // Asetetaan Summary-otsikko sivulle

    // Laskee oikein olevat vastaukset
    const correctAnswersCount = userAnswers.filter(answer => answer.selectedAnswer === answer.correctAnswer).length; // userAnswers-taulukosta suodatetaan kaikki vastaukset, joissa käyttäjän valitsema vastaus on sama kuin oikea vastaus
    // .length-komennolla lasketaan suodatettujen vastausten määrä(=oikein vastatut)

    // Näyttää oikein olevat vastaukset
    summaryContainer.innerHTML += `<p>You got ${correctAnswersCount} out of ${userAnswers.length} answers correct!</p>`;

    userAnswers.forEach((answer, index) => { // Käydään jokainen käyttäjän antama vastaus läpi forEach-silmukassa
        const summaryElement = document.createElement('div'); // Luodaan jokaisella kierroksella uusi div summaryElement = yhteenvetoruudukko jokaiselle kysymykselle
        summaryElement.classList.add('summary-box'); // Lisää tyyliluokan summaryElementille
        summaryElement.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
            <p><strong>Your answer:</strong> ${answer.selectedAnswer}</p>
            <p><strong>Correct answer:</strong> ${answer.correctAnswer}</p>
        `;
        summaryContainer.appendChild(summaryElement); // Lisää jokaisen summaryElementin summaryContainer-elementtiin, jolloin kaikki kysymykset ja vastaukset näkyvät omissa laatikoissaan
    });
}