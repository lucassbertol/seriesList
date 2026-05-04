import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("backlog");
  const [series, setSeries] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tmdbId, setTmdbId] = useState(null);
  const [status, setStatus] = useState("ongoing");
  const [grade, setGrade] = useState("");
  const [dateEnded, setDateEnded] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Buscar séries do banco local
useEffect(() => {
  fetch("http://127.0.0.1:8000/api/series/")
    .then((response) => response.json())
    .then((data) => {
      // Separa as séries por collection_type
      const backlogSeries = data.filter(s => s.collection_type === 'backlog');
      const watchLaterSeries = data.filter(s => s.collection_type === 'watchLater');
      
      setSeries(backlogSeries);
      setWatchLater(watchLaterSeries);
    })
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
    poster_path: posterPath,
    collection_type: activeTab,
  };

  // Se for backlog, adiciona os campos extras
  if (activeTab === "backlog") {
    newSeries.description = description;
    newSeries.status = status;
    newSeries.grade = grade ? parseFloat(grade) : 0.0;
    newSeries.dateEnded = dateEnded || null;
  }

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
      // Adiciona na aba correta
      if (activeTab === "backlog") {
        setSeries([...series, data]);
      } else {
        setWatchLater([...watchLater, data]);
      }
      // Limpa o formulário
      setTitle("");
      setDescription("");
      setPosterPath("");
      setTmdbId(null);
      setGrade("");
      setDateEnded("");
      setSearchQuery("");
    })
    .catch((error) => console.error("Erro ao adicionar série:", error));
};

  const handleDelete = (id) => {
    fetch(`http://127.0.0.1:8000/api/series/${id}/`, {
      method: "DELETE",
    })
      .then(() => {
        // Remove da aba correta
        if (activeTab === "backlog") {
          setSeries(series.filter((item) => item.id !== id));
        } else {
          setWatchLater(watchLater.filter((item) => item.id !== id));
        }
      })
      .catch((error) => console.error("Erro ao excluir série:", error));
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      ongoing: { bg: "#e8f5e9", color: "#2e7d32", label: "Em Andamento" },
      completed: { bg: "#e3f2fd", color: "#1565c0", label: "Concluída" },
      dropped: { bg: "#ffebee", color: "#c62828", label: "Dropada" },
    };
    return statusStyles[status] || statusStyles.ongoing;
  };

  // Dados da aba ativa
  const currentSeriesList = activeTab === "backlog" ? series : watchLater;

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>watchLOG</h1>
          <p>Gerencie seu catálogo de séries e acompanhe suas avaliações</p>
        </div>
      </header>

      <main className="main">
        {/* Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab("backlog")}
            className={`tab-button ${activeTab === "backlog" ? "active" : ""}`}
          >
            Backlog ({series.length})
          </button>
          <button
            onClick={() => setActiveTab("watchLater")}
            className={`tab-button ${activeTab === "watchLater" ? "active" : ""}`}
          >
            Watch Later ({watchLater.length})
          </button>
        </div>

        {/* Formulário */}
        <section className="form-section">
          <h2>+ Adicionar Nova Série ao {activeTab === "backlog" ? "backlog" : "Watch Later"}</h2>

          <form onSubmit={handleSubmit} className="form">
            {/* Busca TMDB */}
            <div className="form-group">
              <label className="form-label">Buscar Série</label>
              <input
                type="text"
                placeholder="Digite o nome da série..."
                value={searchQuery}
                onChange={(e) => handleSearchTMDB(e.target.value)}
                className="form-input"
              />
              {searchResults.length > 0 && (
                <ul className="search-dropdown">
                  {searchResults.map((item) => (
                    <li
                      key={item.tmdb_id}
                      onClick={() => handleSelectSeries(item)}
                    >
                      <strong>{item.title}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Título e Descrição - aparecem em ambas as abas */}
            <div className="form-grid">
              <div>
                <label className="form-label">Título</label>
                <input
                  type="text"
                  placeholder="Título da Série"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={tmdbId ? true : false}
                  className="form-input"
                />
              </div>

              {/* Status e Nota apenas no Backlog */}
              {activeTab === "backlog" && (
                <>
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="ongoing">Em Andamento</option>
                      <option value="completed">Concluída</option>
                      <option value="dropped">Dropada</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Nota (0-10)</label>
                    <input
                      type="number"
                      placeholder="0.0"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      min="0"
                      max="10"
                      step="0.1"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Data de Término</label>
                    <input
                      type="date"
                      value={dateEnded}
                      onChange={(e) => setDateEnded(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Descrição - Full width */}
            <div>
              <label className="form-label">Descrição</label>
              <textarea
                placeholder="Descrição da Série"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                disabled={tmdbId ? true : false}
                className="form-textarea"
              />
            </div>

            <button type="submit" className="submit-button">
              Adicionar Série
            </button>
          </form>
        </section>

        {/* Lista de Séries */}
        <section className="series-section">
          <h2>
            {activeTab === "backlog" ? "Seu Backlog" : "Watch Later"} ({currentSeriesList.length})
          </h2>

          {currentSeriesList.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma série nesta aba ainda. Adicione sua primeira série acima!</p>
            </div>
          ) : (
            <div className="series-grid">
              {currentSeriesList.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                const statusClass = `series-status-${item.status}`;
                return (
                  <div key={item.id} className="series-card">
                    {/* Poster */}
                    {item.poster_path && (
                      <div className="series-poster">
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title}
                        />
                      </div>
                    )}

                    {/* Conteúdo */}
                    <div className="series-content">
                      {/* Título */}
                      <h3 className="series-title">{item.title}</h3>

                      {/* Nota - apenas para Backlog */}
                      {activeTab === "backlog" && (
                        <div className="series-grade">
                          <span className="series-grade-star">⭐</span>
                          <span className="series-grade-value">
                            {parseFloat(item.grade).toFixed(1)}
                          </span>
                          <span className="series-grade-max">/10</span>
                        </div>
                      )}

                      {/* Status Badge - apenas para Backlog */}
                      {activeTab === "backlog" && (
                        <div className={`series-status-badge ${statusClass}`}>
                          {statusBadge.label}
                        </div>
                      )}

                      {/* Descrição */}
                      <p className="series-description">
                        {item.description || "Sem descrição."}
                      </p>

                      {/* Data de término - apenas para Backlog */}
                      {activeTab === "backlog" && item.dateEnded && (
                        <p className="series-date">
                          Finalizado em:{" "}
                          {new Date(item.dateEnded).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>

                    {/* Botão Remover */}
                    <div className="series-actions">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="delete-button"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;