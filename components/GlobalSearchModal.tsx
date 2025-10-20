"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  searchContent,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  SearchResult,
} from "@/lib/searchEngine";

interface GlobalSearchModalProps {
  onClose: () => void;
}

export default function GlobalSearchModal({ onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const searchResults = searchContent(query);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const filteredResults =
    selectedCategory === "All"
      ? results
      : results.filter((r) => r.category === selectedCategory);

  const categories = [
    "All",
    "Ziyarat",
    "Duas",
    "Hadiths",
    "Poems",
    "Sayings",
    "Calendar",
  ];

  const handleResultClick = (result: SearchResult) => {
    saveRecentSearch(query);
    router.push(result.path);
    onClose();
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div
      style={{
        background: "rgba(20, 20, 20, 0.98)",
        border: "2px solid rgba(255, 216, 155, 0.3)",
        borderRadius: "20px",
        maxWidth: "800px",
        width: "100%",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input */}
      <div style={{ padding: "25px 25px 15px 25px" }}>
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Search Ziyarat, Duas, Hadiths, Poems, Sayings..."
            style={{
              width: "100%",
              padding: "15px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "2px solid rgba(255, 216, 155, 0.3)",
              borderRadius: "12px",
              color: "white",
              fontSize: "1.1rem",
              outline: "none",
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                color: "#999",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div
        style={{
          padding: "0 25px 15px 25px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "6px 14px",
              background:
                selectedCategory === cat
                  ? "rgba(255, 216, 155, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${
                selectedCategory === cat
                  ? "rgba(255, 216, 155, 0.5)"
                  : "rgba(255, 255, 255, 0.1)"
              }`,
              borderRadius: "20px",
              color: selectedCategory === cat ? "#ffd89b" : "#999",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: "600",
              transition: "all 0.3s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results / Recent Searches */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 25px 25px 25px",
        }}
      >
        {query.trim().length >= 2 ? (
          // Search Results
          filteredResults.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  style={{
                    padding: "15px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 216, 155, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 216, 155, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.03)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color: "#ffd89b",
                          fontSize: "1.05rem",
                          fontWeight: "600",
                          marginBottom: "4px",
                        }}
                      >
                        {result.title}
                      </div>
                      {result.titleArabic && (
                        <div
                          style={{
                            color: "#93c5fd",
                            fontSize: "0.95rem",
                            fontFamily: "Arabic, serif",
                          }}
                        >
                          {result.titleArabic}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "rgba(255, 216, 155, 0.2)",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        color: "#ffd89b",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {result.category}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#999",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {result.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#666",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🔍</div>
              <div style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
                No results found
              </div>
              <div style={{ fontSize: "0.9rem" }}>
                Try different keywords or check your spelling
              </div>
            </div>
          )
        ) : (
          // Recent Searches
          recentSearches.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <div
                  style={{
                    color: "#999",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  Recent Searches
                </div>
                <button
                  onClick={handleClearRecent}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#666",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  Clear all
                </button>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    style={{
                      padding: "12px 15px",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "8px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "all 0.3s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255, 255, 255, 0.03)";
                    }}
                  >
                    <span style={{ color: "#666" }}>🕐</span>
                    <span style={{ color: "#d0d0d0" }}>{search}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "15px 25px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.85rem",
          color: "#666",
        }}
      >
        <div>
          <kbd
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              padding: "3px 8px",
              borderRadius: "4px",
              marginRight: "5px",
            }}
          >
            ESC
          </kbd>
          to close
        </div>
        <div>{filteredResults.length} results</div>
      </div>
    </div>
  );
}
