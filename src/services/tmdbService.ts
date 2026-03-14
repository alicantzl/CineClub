/* eslint-disable @typescript-eslint/no-explicit-any */
const TMDB_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || '';
const BASE_URL = 'https://api.themoviedb.org/3';

const fetchOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
  }
};

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
}

export const searchMovies = async (query: string): Promise<TMDBMovie[]> => {
  if (!query.trim()) return [];

  try {
    const response = await fetch(`${BASE_URL}/search/movie?language=tr-TR&query=${encodeURIComponent(query)}&page=1`, fetchOptions);
    if (!response.ok) {
       throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB API Error: ", error);
    return [];
  }
};

export const getTrendingMovies = async (region?: string): Promise<TMDBMovie[]> => {
  try {
    const url = region 
      ? `${BASE_URL}/trending/movie/week?language=tr-TR&region=${region}`
      : `${BASE_URL}/trending/movie/week?language=tr-TR`;
      
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
       throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("TMDB Trending API Error: ", error);
    return [];
  }
};

export const getMovies = async (type: 'popular' | 'top_rated' | 'upcoming'): Promise<TMDBMovie[]> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${type}?language=tr-TR&page=1`, fetchOptions);
    if (!response.ok) {
       throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error(`TMDB ${type} API Error: `, error);
    return [];
  }
};

// Gets default youtube trailer/video Id (mocking for MVP unless we call /videos endpoint)
export const getMovieTrailerId = async (movieId: number): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/videos?language=tr-TR`, fetchOptions);
    if (response.ok) {
      const data = await response.json();
      const trailer = data.results.find((vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube');
      if (trailer) return trailer.key;
    }
    
    // Fallback to English trailers if Turkish doesn't exist
    const fallbackRes = await fetch(`${BASE_URL}/movie/${movieId}/videos?language=en-US`, fetchOptions);
    if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const fallbackTrailer = fallbackData.results.find((vid: any) => vid.type === 'Trailer' && vid.site === 'YouTube');
        if (fallbackTrailer) return fallbackTrailer.key;
    }
  } catch (error) {
    console.error("Error fetching trailer from TMDB", error);
  }

  return "YoHD9KRokEg"; // Default to a cool Inception or generic trailer if nothing works
};

export const tmdbService = {
  searchMovies,
  getTrending: getTrendingMovies,
  getMovies,
  getMovieTrailerId
};
