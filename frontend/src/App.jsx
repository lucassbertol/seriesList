import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Estados para gerenciar as séries e o formulário
  const [series, setSeries] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Buscar as séries no backend assim que a tela carregar (GET)
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/series/')
      .then((response) => response.json())
      .then((data) => setSeries(data))
      .catch((error) => console.error("Erro ao carregar séries:", error));
  }, []);

  // Função para enviar uma nova série para o backend (POST)
  const handleSubmit = (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar o form

    const newSeries = { title, description };

    fetch('http://127.0.0.1:8000/api/series/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSeries),
    })
      .then((response) => response.json())
      .then((data) => {
        // Atualiza a lista na tela de forma instantânea com a nova série
        setSeries([...series, data]);
        // Limpa os campos do formulário
        setTitle('');
        setDescription('');
      })
      .catch((error) => console.error("Erro ao adicionar série:", error));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>seriesList</h1>

      {/* FORMULÁRIO*/}
      <section style={{ margin: '40px 0', padding: '20px', background: '#2c2c2c', borderRadius: '8px' }}>
        <h2>Adicionar Nova Série</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Título da Série"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '5px' }}
          />
          <textarea
            placeholder="Descrição da Série (Opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{ padding: '10px', borderRadius: '5px' }}
          />
          <button type="submit" style={{ padding: '10px', cursor: 'pointer', background: '#646cff' }}>
            Adicionar na Lista
          </button>
        </form>
      </section>

      {/* LISTAGEM DAS SÉRIES*/}
      <section>
        <h2>Séries Cadastradas</h2>
        {series.length === 0 ? (
          <p>Nenhuma série no backlog ainda. Que tal adicionar a primeira?</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {series.map((item) => (
              <li key={item.id} style={{ border: '1px solid #444', marginBottom: '10px', padding: '15px', borderRadius: '8px', textAlign: 'left' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#646cff' }}>{item.title}</h3>
                <p style={{ margin: 0 }}>{item.description || "Sem descrição."}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;