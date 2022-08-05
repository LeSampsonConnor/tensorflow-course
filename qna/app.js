require('@tensorflow/tfjs');
const { prompt, Select } = require('enquirer');
const qna = require('@tensorflow-models/qna');

const getPassage = async (model) => {
	let passage = '';
	await prompt({
		type: 'input',
		name: 'passage',
		message: 'Enter a passage to search for questions and answers:',
		initial: 'The meaning of life is 42.',
	}).then((answer) => {
		passage = answer.passage;
	});

	askQuestion(passage, model);
};

const askQuestion = async (passage, model) => {
	let question = '';
	await prompt({
		type: 'input',
		name: 'question',
		message: 'Enter a question to search for an answer:',
		initial: 'What is the meaning of life?',
	}).then((answer) => {
		question = answer.question;
	});

	console.log('Looking for answer to question:', question);
	const answers = await model.findAnswers(question, passage);
	if (answers.length > 0) {
		console.log(`Found an answer: ${answers[0].text}`);
	} else {
		console.log('No answers found.');
	}

	const selectPrompt = new Select({
		name: 'nextStep',
		message: 'Would you like to do next?',
		choices: ['Ask Another Question', 'Look for another passage', 'Exit'],
	});

	selectPrompt
		.run()
		.then((answer) => {
			let response = answer;
			console.log('Next step:', response);
			if (response === 'Ask Another Question') {
				return askQuestion(passage, model);
			}
			if (response === 'Look for another passage') {
				return getPassage(model);
			}
			if (response === 'Exit') {
				console.log('Goodby...');
				process.exit();
			}
		})
		.catch(console.error);
};

const App = async () => {
	// TFJS model
	console.log('Loading model...');
	const model = await qna.load();
	getPassage(model);
};

App();

exports.App = App;
