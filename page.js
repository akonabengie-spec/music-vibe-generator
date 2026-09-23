'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

// Dynamically loads standard global Tailwind stylesheets directly into the header space
if (typeof window !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = 'https://tailwindcss.com';
  document.head.appendChild(script);
}

export default function Home() {
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentVibe, setCurrentVibe] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dbFavorites, setDbFavorites] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  const vibes = [
    { name: 'Chill 🏖️', tag: 'chill' },
    { name: 'Workout 🔥', tag: 'workout' },
    { name: 'Focus 🧠', tag: 'ambient' },
    { name: 'Party 🎉', tag: 'party' },
  ];

  useEffect(() => {
    fetchSavedFavorites();
  }, []);

  const fetchSavedFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDbFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error.message);
    }
  };

  const saveTrackToDatabase = async (track) => {
    setSaveStatus(`Saving "${track.title}"...`);
    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{ title: track.title, artist: track.artist, track_url: track.url }]);

      if (error) throw error;
      setSaveStatus('Track successfully bookmarked in Cloud!');
      fetchSavedFavorites();
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error writing to Supabase:', error.message);
      setSaveStatus(`Database write failed: ${error.message}`);
    }
  };

  const deleteTrackFromDatabase = async (id, title) => {
    setSaveStatus(`Removing "${title}"...`);
    try {
      const { error } = await supabase.from('favorites').delete().eq('id', id);
      if (error) throw error;
      setSaveStatus('Track removed from database cluster.');
      fetchSavedFavorites(); 
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error deleting from Supabase:', error.message);
      setSaveStatus(`Delete failed: ${error.message}`);
    }
  };

  const fetchVibePlaylist = async (tag, displayName) => {
    if (!tag.trim()) return;
    setLoading(true);
    setCurrentVibe(displayName);
    try {
      const response = await fetch(`/api/get-vibe?vibe=${encodeURIComponent(tag.toLowerCase())}`);
      const data = await response.json();
      setPlaylist(data.playlist || []);
    } catch (error) {
      console.error('Error generating playlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVibePlaylist(searchQuery, searchQuery);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-start p-6 md:p-16 font-sans">
      <div className="max-w-2xl text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          VibeSync Engine + Database
        </h1>
        <p className="text-slate-400 text-base">
          Query music metadata and bookmark data packages directly onto your cloud server instance.
        </p>
      </div>

      {saveStatus && (
        <div className="mb-6 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-semibold rounded-lg text-sm transition-all">
          {saveStatus}
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mb-6 flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type any custom vibe or genre (e.g., lofi, jazz, reggae)..."
          className="w-full p-4 bg-slate-800/80 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 text-slate-100 font-medium"
        />
        <button type="submit" className="px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl transition-all active:scale-95 cursor-pointer">
          Search Vibe
        </button>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-8">
        {vibes.map((vibe) => (
          <button
            key={vibe.tag}
            onClick={() => {
              setSearchQuery('');
              fetchVibePlaylist(vibe.tag, vibe.name);
            }}
            className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl border border-slate-700/60 font-semibold text-sm cursor-pointer"
          >
            {vibe.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl items-start">
        <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-800/80 shadow-xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400 text-sm">Crawling global metadata structures...</p>
            </div>
          ) : playlist.length > 0 ? (
            <div>
              <h2 className="text-lg font-bold text-slate-200 mb-4 capitalize">
                Live Query: <span className="text-emerald-400">{currentVibe}</span>
              </h2>
              <div className="space-y-3">
                {playlist.map((track, idx) => (
                  <div key={idx} className="flex flex-col p-4 bg-slate-800 rounded-xl border border-slate-700/50">
                    <div className="mb-3 truncate">
                      <p className="font-bold text-slate-200 truncate">{track.title}</p>
                      <p className="text-xs text-slate-400 truncate">{track.artist}</p>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => saveTrackToDatabase(track)}
                        className="w-full text-center text-xs font-bold py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-slate-900 border border-emerald-500/20 rounded-lg transition-colors cursor-pointer"
                      >
                        ⭐ Favorite
                      </button>
                      <a href={track.url} target="_blank" rel="noopener noreferrer" className="w-1/3 text-center text-xs font-semibold py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                        Meta
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-sm">
              Use input modules to stream live track grids.
            </div>
          )}
        </div>

        <div className="bg-slate-800/20 rounded-2xl p-6 border border-slate-800/50 shadow-xl">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center justify-between">
            <span>Cloud Database Cloud Cluster</span>
            <span className="text-xs bg-slate-700 px-2 py-1 rounded text-cyan-400 font-mono font-semibold">PostgreSQL</span>
          </h2>
          {dbFavorites.length > 0 ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {dbFavorites.map((fav) => (
                <div key={fav.id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 hover:border-red-500/30 transition-all group">
                  <div className="truncate pr-4 w-2/3">
                    <p className="text-sm font-bold text-slate-300 truncate">{fav.title}</p>
                    <p className="text-xs text-slate-500 truncate">{fav.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-slate-500 border border-slate-800 px-2 py-1 rounded whitespace-nowrap">
                      ID: #{fav.id}
                    </span>
                    <button
                      onClick={() => deleteTrackFromDatabase(fav.id, fav.title)}
                      className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all text-xs cursor-pointer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600 text-xs font-mono">
              [Database Empty] No rows inserted inside public.favorites schema yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
