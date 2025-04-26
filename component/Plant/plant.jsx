import { useState } from "react";
import { TextField, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
      <TextField
        type="text"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyPress}
        fullWidth
        size="small"
      />
      <Button 
        variant="contained" 
        onClick={handleSearch}
        startIcon={<SearchIcon />}
      >
        Search
      </Button>
    </div>
  );
}

