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

  const getStatusBadge = (status) => {
    const statusStyles = {
      ongoing: { bg: "#e8f5e9", color: "#2e7d32", label: "Em Andamento" },
      completed: { bg: "#e3f2fd", color: "#1565c0", label: "Concluída" },
      dropped: { bg: "#ffebee", color: "#c62828", label: "Dropada" },
    };
    return statusStyles[status] || statusStyles.ongoing;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117" }}>
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)",
          color: "white",
          padding: "32px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          borderBottom: "1px solid #30363d",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              fontWeight: "700",
              letterSpacing: "-0.5px",
            }}
          >
            watchLOG
          </h1>
          <p
            style={{
              margin: "8px 0 0 0",
              fontSize: "14px",
              opacity: 0.9,
              fontWeight: "300",
            }}
          >
            Gerencie seu catálogo de séries e acompanhe suas avaliações
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Formulário */}
        <section
          style={{
            background: "#161b22",
            borderRadius: "12px",
            padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
            border: "1px solid #30363d",
          }}
        >
          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#e0e0e0",
            }}
          >
            + Adicionar Nova Série
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {/* Busca TMDB */}
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#a0a0a0",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Buscar Série
              </label>
              <input
                type="text"
                placeholder="Digite o nome da série..."
                value={searchQuery}
                onChange={(e) => handleSearchTMDB(e.target.value)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #30363d",
                  width: "100%",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  background: "#0d1117",
                  color: "#e0e0e0",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#58a6ff";
                  e.target.style.boxShadow = "0 0 0 3px rgba(88, 166, 255, 0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#30363d";
                  e.target.style.boxShadow = "none";
                }}
              />
              {searchResults.length > 0 && (
                <ul
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    listStyle: "none",
                    padding: 0,
                    margin: "8px 0 0 0",
                    background: "#161b22",
                    border: "1px solid #30363d",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 10,
                    maxHeight: "250px",
                    overflowY: "auto",
                  }}
                >
                  {searchResults.map((item) => (
                    <li
                      key={item.tmdb_id}
                      onClick={() => handleSelectSeries(item)}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: "1px solid #30363d",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#0d1117")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <strong style={{ color: "#e0e0e0" }}>
                        {item.title}
                      </strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Grid de inputs */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#a0a0a0",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Título
                </label>
                <input
                  type="text"
                  placeholder="Título da Série"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={tmdbId ? true : false}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #30363d",
                    width: "100%",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    opacity: tmdbId ? 0.6 : 1,
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    background: "#0d1117",
                    color: "#e0e0e0",
                  }}
                  onFocus={(e) => {
                    if (!tmdbId) {
                      e.target.style.borderColor = "#58a6ff";
                      e.target.style.boxShadow = "0 0 0 3px rgba(88, 166, 255, 0.15)";
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#30363d";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#a0a0a0",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #30363d",
                    width: "100%",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    background: "#0d1117",
                    color: "#e0e0e0",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#58a6ff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(88, 166, 255, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#30363d";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="ongoing">Em Andamento</option>
                  <option value="completed">Concluída</option>
                  <option value="dropped">Dropada</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#a0a0a0",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Nota (0-10)
                </label>
                <input
                  type="number"
                  placeholder="0.0"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max="10"
                  step="0.1"
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #30363d",
                    width: "100%",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    background: "#0d1117",
                    color: "#e0e0e0",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#58a6ff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(88, 166, 255, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#30363d";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#a0a0a0",
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Data de Término
                </label>
                <input
                  type="date"
                  value={dateEnded}
                  onChange={(e) => setDateEnded(e.target.value)}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #30363d",
                    width: "100%",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                    background: "#0d1117",
                    color: "#e0e0e0",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#58a6ff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(88, 166, 255, 0.15)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#30363d";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Descrição - Full width */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#a0a0a0",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Descrição
              </label>
              <textarea
                placeholder="Descrição da Série"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                disabled={tmdbId ? true : false}
                style={{
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #30363d",
                  width: "100%",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  opacity: tmdbId ? 0.6 : 1,
                  resize: "vertical",
                  transition: "all 0.2s",
                  boxSizing: "border-box",
                  background: "#0d1117",
                  color: "#e0e0e0",
                }}
                onFocus={(e) => {
                  if (!tmdbId) {
                    e.target.style.borderColor = "#58a6ff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(88, 166, 255, 0.15)";
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#30363d";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: "12px 24px",
                marginTop: "8px",
                cursor: "pointer",
                background: "linear-gradient(135deg, #1f6feb 0%, #388bfd 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s",
                boxShadow: "0 2px 8px rgba(31, 111, 235, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 12px rgba(31, 111, 235, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 8px rgba(31, 111, 235, 0.3)";
              }}
            >
              Adicionar Série
            </button>
          </form>
        </section>

        {/* Lista de Séries */}
        <section>
          <h2
            style={{
              margin: "0 0 24px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#e0e0e0",
            }}
          >
            Seu Backlog ({series.length})
          </h2>

          {series.length === 0 ? (
            <div
              style={{
                background: "#161b22",
                borderRadius: "12px",
                padding: "48px 32px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                border: "1px solid #30363d",
              }}
            >
              <p
                style={{
                  fontSize: "16px",
                  color: "#a0a0a0",
                  margin: 0,
                }}
              >
                Nenhuma série no backlog ainda. Adicione sua primeira série acima!
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {series.map((item) => {
                const statusBadge = getStatusBadge(item.status);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#161b22",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                      transition: "all 0.3s",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      border: "1px solid #30363d",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(88, 166, 255, 0.2)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "#58a6ff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 1px 3px rgba(0,0,0,0.3)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#30363d";
                    }}
                  >
                    {/* Poster */}
                    {item.poster_path && (
                      <div
                        style={{
                          width: "100%",
                          height: "180px",
                          background: "#0d1117",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    )}

                    {/* Conteúdo */}
                    <div style={{ padding: "16px", flex: 1 }}>
                      {/* Título e Nota */}
                      <h3
                        style={{
                          margin: "0 0 8px 0",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#e0e0e0",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.title}
                      </h3>

                      {/* Nota */}
                      <div
                        style={{
                          marginBottom: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>⭐</span>
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#ffd700",
                          }}
                        >
                          {parseFloat(item.grade).toFixed(1)}
                        </span>
                        <span style={{ fontSize: "14px", color: "#707070" }}>
                          /10
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div
                        style={{
                          display: "inline-block",
                          background: statusBadge.bg,
                          color: statusBadge.color,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "12px",
                          opacity: 0.8,
                        }}
                      >
                        {statusBadge.label}
                      </div>

                      {/* Descrição */}
                      <p
                        style={{
                          margin: "12px 0",
                          fontSize: "13px",
                          color: "#a0a0a0",
                          lineHeight: "1.5",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.description || "Sem descrição."}
                      </p>

                      {/* Data de término */}
                      {item.dateEnded && (
                        <p
                          style={{
                            margin: "8px 0",
                            fontSize: "12px",
                            color: "#707070",
                          }}
                        >
                          📅 Finalizado em:{" "}
                          {new Date(item.dateEnded).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>

                    {/* Botão Remover */}
                    <div style={{ padding: "0 16px 16px 16px" }}>
                      <button
                        onClick={() => handleDelete(item.id)}
                        style={{
                          width: "100%",
                          padding: "10px",
                          cursor: "pointer",
                          background: "#30363d",
                          color: "#f85149",
                          border: "1px solid #f85149",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "#f85149";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "#30363d";
                          e.target.style.color = "#f85149";
                        }}
                      >
                        🗑️ Remover
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
