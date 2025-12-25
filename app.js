const searchInput = document.getElementById('searchInput');
const suggestionBox = document.getElementById('suggestions');

// 1. Live Suggestions (No Key API: Datamuse)
searchInput.addEventListener('input', async () => {
    const val = searchInput.value;
    if (val.length < 2) {
        suggestionBox.classList.add('hidden');
        return;
    }

    const res = await fetch(`https://api.datamuse.com/sug?s=${val}`);
    const data = await res.json();

    suggestionBox.innerHTML = data.slice(0, 5).map(item => `
        <div class="p-4 hover:bg-slate-50 cursor-pointer border-b last:border-0" onclick="selectSuggestion('${item.word}')">
            <i class="fas fa-search text-slate-300 mr-3"></i> ${item.word}
        </div>
    `).join('');
    suggestionBox.classList.remove('hidden');
});

function selectSuggestion(word) {
    searchInput.value = word;
    suggestionBox.classList.add('hidden');
    performSearch();
}

// 2. Perform Search (Using DDG Instant Answer API - No Key)
async function performSearch() {
    const query = searchInput.value;
    if (!query) return;

    // UI Animations
    document.getElementById('main-container').classList.remove('min-h-screen');
    document.getElementById('main-container').classList.add('pt-10', 'pb-5');
    document.getElementById('logo').classList.add('text-3xl', 'mb-4');
    document.getElementById('footer-text').classList.add('hidden');
    suggestionBox.classList.add('hidden');

    try {
        // Fetch Instant Answer from DuckDuckGo
        const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`);
        const data = await response.json();

        const answerDiv = document.getElementById('instant-answer');
        if (data.AbstractText) {
            answerDiv.classList.remove('hidden');
            document.getElementById('answer-title').innerText = data.Heading;
            document.getElementById('answer-body').innerText = data.AbstractText;
            document.getElementById('answer-link').href = data.AbstractURL;
        } else {
            answerDiv.classList.add('hidden');
        }

        // Handle Web Results (Simulated for this demo using RelatedTopics)
        const resultsContainer = document.getElementById('results-container');
        const resultsList = document.getElementById('web-results');
        resultsContainer.classList.remove('hidden');
        
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            resultsList.innerHTML = data.RelatedTopics.slice(0, 5).map(topic => {
                if (!topic.Text) return '';
                return `
                    <div class="animate-fade-in">
                        <a href="${topic.FirstURL}" target="_blank" class="text-xl text-indigo-600 font-bold hover:underline block mb-1">
                            ${topic.Text.split(' - ')[0] || query}
                        </a>
                        <p class="text-slate-600 leading-relaxed">${topic.Text}</p>
                    </div>
                `;
            }).join('');
        } else {
            // Fallback: If no instant answer, provide a direct link to the independent web
            resultsList.innerHTML = `
                <div class="text-center py-10">
                    <p class="text-slate-500 mb-4">No instant answer found for "${query}".</p>
                    <a href="https://duckduckgo.com/?q=${encodeURIComponent(query)}" target="_blank" 
                       class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold">
                       View Full Independent Results
                    </a>
                </div>
            `;
        }
    } catch (err) {
        console.error("Mimi Error:", err);
    }
}

// Press Enter to Search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});
