/**
 * Creates an array of numbers in a given range in a random order
 * @param {Number} max - Maximum number in range 
 * @param {Number} min - (optional) Minimum number in range
 * @returns Randomised list of numbers
 */
 const genRandomIndexes = (max, min = 0) => new Array(max - min).fill(0).map((v,i)=>i+min);

 const getRandomEmoji = emojis => emojis[Math.floor(Math.random() * emojis.length)];
 
 /**
  * In place shuffles array into a random order
  * @param {Array} arr - Array to be shuffled
  * @returns Randomised array
  */
 const shuffle = (arr) => {
   for(let i = arr.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i+1));
     [arr[i], arr[j]] = [arr[j], arr[i]];
   }
   return arr;
 }
 
 /**
  * Generates a card element using the template and participant data passed.
  * @param {Object} participant - Participant data
  * @param {Array} emojis - Array of emojis
  * @param {Element} template - Template element to clone
  * @returns 
  */
 const generateCardFromTemplate = (participant, emojis, template) => {
   const card = template.content.firstElementChild.cloneNode(true);
   const fields = card.querySelectorAll('[data-field]');
 
   for (const field of fields) {
     if (field.dataset.field == 'link') {
       field.setAttribute('href', `community/${participant.name}`);
     } else if (field.dataset.field == 'random_emoji') {
       field.innerText = getRandomEmoji(emojis);
     } else {
       field.innerText = participant[field.dataset.field];
     }
     // We don't need the data-field anymore:
     delete field.dataset.field;
   }
   return card;
 }
 
 const createParticipantes = (participants, elements, emojis) => {
   const fragment = new DocumentFragment();
   participants.forEach(participant => {
     fragment.append(generateCardFromTemplate(participant, emojis, elements.template));
   });
   elements.container.append(fragment);
 }
 
 const createShowcases = (participants, pages, elements, emojis) => {
   const fragment = new DocumentFragment();
   // Generate random indexes
   const indexes = genRandomIndexes(participants.length);
   let remaining = elements.count;
   for (const idx of indexes) {
     // Check participant has custom page
     if (pages.includes(participants[idx].name)) {
       remaining--;
       fragment.append(generateCardFromTemplate(participants[idx], emojis, elements.template))
     }
     if (!remaining) break;
   }
 
   elements.container.append(fragment);
 }
 
 (()=>{
 
   const communityElements = {
     container: document.querySelector("#community"),
     template: document.querySelector("#community > .item-template")
   };
   const showcaseElements = {
     count: 5,
     container: document.getElementById("showcases"),
     template: document.querySelector("#showcases > .item-template")
   };
   
   // Preload data
   Promise.all([
 
     // Participant records
     fetch("assets/data/community.json")
       .then(response => response.json()),
     // List of participant custom pages
     fetch("assets/data/communitypages.json")
       .then(response => response.json()),
     // Emoji list
     fetch("assets/data/emojis.json")
       .then((response) => response.json()),
 
   ]).then((values) => {
     // When all data has loaded:
     const [participants, pages, emojis] = values;
     if (showcaseElements.container && showcaseElements.template) {
       createShowcases(participants, pages, showcaseElements, emojis);
     }
     createParticipantes(participants, communityElements, emojis);
   });
   
 })();