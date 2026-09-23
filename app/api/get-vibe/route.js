import { NextResponse } from 'next/server';

export async function GET(request) {
  // 1. Parse the vibe or tag parameter sent from the user dashboard click
  const { searchParams } = new URL(request.url);
  const vibe = searchParams.get('vibe') || 'chill';

  // 2. Hardcode your active verified Last.fm key cleanly 
  const apiKey = "f67e4fa431b1a97b5ecd02d941faa42c";
  
  // 3. Clean, bulletproof URL concatenation parameters
  const baseDomain = "https://ws.audioscrobbler.com/2.0/";
  const queryParams = "?method=tag.gettoptracks" +
                      "&tag=" + encodeURIComponent(vibe) +
                      "&api_key=" + apiKey +
                      "&format=json" + 
                      "&limit=10";
  
  const lastFmUrl = baseDomain + queryParams;

  try {
    // 4. Fire the network request to the global music metadata server
    const response = await fetch(lastFmUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    // 5. Catch HTML error responses cleanly before parsing json
    if (!response.ok) {
      const errorHtml = await response.text();
      console.error("Last.fm error fallback page returned.");
      return NextResponse.json({ error: 'Music server rejected requests' }, { status: response.status });
    }

    const data = await response.json();
    
    // 6. Drill down into the JSON arrays safely
    const rawTracks = data.tracks?.track || [];
    const cleanTracks = rawTracks.map(track => ({
      title: track.name || 'Unknown Track',
      artist: track.artist?.name || 'Unknown Artist',
      url: track.url || '#'
    }));

    // 7. Hand over the polished array data right back to your dashboard page grid cards
    return NextResponse.json({ playlist: cleanTracks });

  } catch (error) {
    console.error("Backend Music Engine Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
