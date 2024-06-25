import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApiClient } from '../services/api/authApiClient';
import { AccessToken } from '../types/AccessToken';
import { useEffect } from 'react';
import { useAuth } from '../custom/useAuth';

function WelcomePage() {
  const [searchParams] = useSearchParams();
  const { token, setToken } = useAuth();
  const navigate = useNavigate();

  const spotifyCode = searchParams.get('code');
  if (spotifyCode && (!token || token.expiresIn < new Date())) {
    authApiClient.secondStep(spotifyCode).then((authToken: AccessToken): void => {
      setToken(authToken);
    });
  }

  useEffect(() => {
    if (token.accessToken) {
      navigate('/playlists');
    }
  }, [token]);

  return (
    <div className="text-center p-6">
      <h1 className="mt-10 sm:mt-20 text-6xl mb-8">Spotify Duplicates Detector</h1>
      <p className="text-2xl mb-4">
        Do you find yourself adding songs to your playlists and forgetting if you already have added
        them? I know Spotify warns you whenever that happens...{' '}
        <b className="text-alt">Half of the time!</b>
      </p>
      <p className="text-2xl mb-8">
        Just sign in, analyze a playlist and detect possible duplicates.{' '}
        <b className="text-alt">As easy as it sounds!</b>
      </p>
      <button
        onClick={() => authApiClient.firstStep()}
        className="border rounded-full px-6 py-2 border-gray-800 text-black font-bold bg-alt hover:bg-green-600 ease-linear transition-all"
      >
        Sign In
      </button>
    </div>
  );
}

export default WelcomePage;
