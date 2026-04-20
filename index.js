let allPokemon = [];

const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const pokemonGrid = document.getElementById('pokemonGrid');
const clearSearch = document.getElementById('clearSearch');
const modal = document.getElementById('pokemonModal');
const closeModal = document.getElementById('closeModal');
const modalBody = document.getElementById('modalBody');

async function loadAllPokemon() {
    try {
        console.log('Cargando 151 Pokemones...');
        pokemonGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: white; font-size: 1.2rem;">Cargando Pokémon...</div>';
        
        const pokemonPromises = [];
        for (let i = 1; i <= 250; i++) {
            pokemonPromises.push(fetchPokemonData(i));
        }

        allPokemon = (await Promise.all(pokemonPromises)).filter(p => p !== null);
        displayPokemon(allPokemon);
        console.log(` ¡${allPokemon.length} Pokemones cargados!`);
    } catch (error) {
        console.error('Error:', error);
        loadLocalPokemon();
    }
}           

async function fetchPokemonData(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();
        
        const types = data.types.map(type => type.type.name);
        const stats = {
            hp: data.stats[0].base_stat,
            attack: data.stats[1].base_stat,
            defense: data.stats[2].base_stat,
            spAttack: data.stats[3].base_stat,
            spDefense: data.stats[4].base_stat,
            speed: data.stats[5].base_stat
        };
        
        return {
            id: data.id,
            name: data.name.charAt(0).toUpperCase() + data.name.slice(1),
            types,
            sprite: data.sprites.front_default || data.sprites.other['official-artwork'].front_default,
            ...stats
        };
    } catch (error) {
        return null;
    }
}

function loadLocalPokemon() {
    allPokemon = [
        { id: 1, name: "Bulbasaur", types: ["grass", "poison"], sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 },
        { id: 25, name: "Pikachu", types: ["electric"], sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
        { id: 151, name: "Mew", types: ["psychic"], sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png", hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 }
    ];
    displayPokemon(allPokemon);
}

function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = '';
    
    pokemonList.forEach(pokemon => {
        const pokemonCard = createPokemonCard(pokemon);
        pokemonGrid.appendChild(pokemonCard);
    });
}

function createPokemonCard(pokemon) {
    const card = document.createElement('section');
    card.className = 'pokemon-card';
    card.onclick = () => showPokemonModal(pokemon);
    
    card.innerHTML = `
        <section class="pokemon-id">#${pokemon.id.toString().padStart(3, '0')}</section>
        <img src="${pokemon.sprite}" alt="${pokemon.name}" class="pokemon-sprite" loading="lazy">
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <section class="pokemon-types">
            ${pokemon.types.map(type => `<span class="type-badge ${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`).join('')}
        </section>
    `;
    
    return card;
}

function showPokemonModal(pokemon) {
    modal.style.display = 'block';
    
    modalBody.innerHTML = `
        <main class="modal-pokemon">
            <img src="${pokemon.sprite}" alt="${pokemon.name}" class="modal-sprite">
            <h2 class="modal-name">${pokemon.name}</h2>
            <section class="modal-id">#${pokemon.id.toString().padStart(3, '0')}</section>
            
            <section class="modal-types">
                <div class="modal-type-title">Tipos</div>
                <div class="types-grid">
                    ${pokemon.types.map(type => `<span class="type-badge ${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</span>`).join('')}
                </div>
            </section>
            
            <section class="modal-stats">
                <div class="stat-item">
                    <div class="stat-label">HP</div>
                    <div class="stat-value">${pokemon.hp}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Ataque</div>
                    <div class="stat-value">${pokemon.attack}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Defensa</div>
                    <div class="stat-value">${pokemon.defense}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Atq. Esp.</div>
                    <div class="stat-value">${pokemon.spAttack}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Def. Esp.</div>
                    <div class="stat-value">${pokemon.spDefense}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Velocidad</div>
                    <div class="stat-value">${pokemon.speed}</div>
                </div>
            </section>
        </main>
    `;
}

//FILTRO DE B.//
let searchTimeout;
function filterPokemon() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedType = typeFilter.value.toLowerCase();
    const filteredPokemon = allPokemon.filter(pokemon => {
        const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm) ||
                              pokemon.id.toString().includes(searchTerm);
        const matchesType = !selectedType || pokemon.types.some(type => type === selectedType);
        return matchesSearch && matchesType;
    });
    displayPokemon(filteredPokemon);
}

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterPokemon, 300); //debounce básico//
});

typeFilter.addEventListener('change', filterPokemon);

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    typeFilter.value = '';
    displayPokemon(allPokemon);
});

closeModal.onclick = () => modal.style.display = 'none';

window.onclick = (event) => {
    if (event.target === modal) modal.style.display = 'none';
};

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') modal.style.display = 'none';
});

function animatePokemonCards() {
    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllPokemon();
    setTimeout(animatePokemonCards, 2000);
});




















