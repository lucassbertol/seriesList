import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [series, setSeries] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tmdbId, setTmdbId] = useState(null);
  const [status, setStatus] = useState("ongoing");
  const [grade, setGrade] = useState("");
  const [dateEnded, setDateEnded] = useState("");
  const [posterPath, setPosterPath] = useState("");

  // estado para resultados de busca
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar séries do banco local
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/series/")
      .then((response) => response.json())
      .then((data) => setSeries(data))
      .catch((error) => console.error("Erro ao carregar séries:", error));
  }, []);

  // buscar séries da TMDB enquanto digita
  const handleSearchTMDB = (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    fetch(`http://127.0.0.1:8000/api/series/search-tmdb/?q=${query}`)
      .then((response) => response.json())
      .then((data) => setSearchResults(data))
      .catch((error) => console.error("Erro na busca:", error));
  };

  // selecionar série da TMDB
  const handleSelectSeries = (item) => {
    setTitle(item.title);
    setDescription(item.description);
    setTmdbId(item.tmdb_id);
    setPosterPath(item.poster_path);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newSeries = {
      tmdb_id: tmdbId,
      title,
      description,
      poster_path: posterPath,
      status,
      grade: grade ? parseFloat(grade) : 0.0,
      dateEnded: dateEnded || null,
    };

    fetch("http://127.0.0.1:8000/api/series/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSeries),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Erro na API.");
        return response.json();
      })
      .then((data) => {
        setSeries([...series, data]);
        setTitle("");
        setDescription("");
        setPosterPath("");
        setTmdbId(null);
        setGrade("");
        setDateEnded("");
      })
      .catch((error) => console.error("Erro ao adicionar série:", error));
  };

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8000/api/series/${id}/`, {
      method: "DELETE",
    })
      .then(() => {
        setSeries(series.filter((item) => item.id !== id));
      })
      .catch((error) => console.error("Erro ao excluir série:", error));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <h1>seriesList</h1>

      <section
        style={{
          margin: "40px 0",
          padding: "20px",
          background: "#2c2c2c",
          borderRadius: "8px",
        }}
      >
        <h2>Adicionar Nova Série</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          {/* campo de busca TMDB */}
          <div>
            <input
              type="text"
              placeholder="Buscar série no TMDB..."
              value={searchQuery}
              onChange={(e) => handleSearchTMDB(e.target.value)}
              style={{ padding: "10px", borderRadius: "5px", width: "100%" }}
            />
            {searchResults.length > 0 && (
              <ul
                style={{
                  listStyle: "none",
                  padding: "10px",
                  background: "#1a1a1a",
                  marginTop: "5px",
                  borderRadius: "5px",
                }}
              >
                {searchResults.map((item) => (
                  <li
                    key={item.tmdb_id}
                    onClick={() => handleSelectSeries(item)}
                    style={{
                      padding: "8px",
                      cursor: "pointer",
                      borderBottom: "1px solid #444",
                      hover: { background: "#333" },
                    }}
                  >
                    <strong>{item.title}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="text"
            placeholder="Título da Série"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ padding: "10px", borderRadius: "5px" }}
            disabled={tmdbId ? true : false}
          />
          <textarea
            placeholder="Descrição da Série"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            style={{ padding: "10px", borderRadius: "5px" }}
            disabled={tmdbId ? true : false}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px" }}
          >
            <option value="ongoing">Em Andamento</option>
            <option value="completed">Concluída</option>
            <option value="dropped">Dropada</option>
          </select>
          <input
            type="number"
            placeholder="Nota (0.0 - 10.0)"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            min="0"
            max="10"
            step="0.1"
            style={{ padding: "10px", borderRadius: "5px" }}
          />
          <input
            type="date"
            placeholder="Data de Término"
            value={dateEnded}
            onChange={(e) => setDateEnded(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px" }}
          />

          <button
            type="submit"
            style={{
              padding: "10px",
              cursor: "pointer",
              background: "#646cff",
            }}
          >
            Adicionar na Lista
          </button>
        </form>
      </section>

      <section>
        <h2>Séries Cadastradas</h2>
        {series.length === 0 ? (
          <p>Nenhuma série no backlog ainda.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {series.map((item) => (
              <li
                key={item.id}
                style={{
                  border: "1px solid #444",
                  marginBottom: "10px",
                  padding: "15px",
                  borderRadius: "8px",
                }}
              >
                {item.poster_path && (
                  <img
                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                    alt={item.title}
                    style={{
                      width: "100px",
                      marginBottom: "10px",
                      borderRadius: "5px",
                    }}
                  />
                )}
                <h3 style={{ margin: "0 0 10px 0", color: "#646cff" }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0 }}>
                  {item.description || "Sem descrição."}
                </p>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    marginTop: "10px",
                    padding: "5px 10px",
                    cursor: "pointer",
                    background: "#ff6464",
                  }}
                >
                  Remover série
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
