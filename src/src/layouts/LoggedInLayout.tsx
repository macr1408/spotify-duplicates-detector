import { ReactNode, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoggedInLayout = ({ children }: { children: ReactNode }) => {
  const { token, removeToken } = useContext(AuthContext);
  const navigate = useNavigate();

  const logOut = () => {
    removeToken();
  };

  useEffect(() => {
    if (!token.accessToken) {
      navigate('/');
    }
  }, [token]);

  return (
    <>
      <div className="text-center p-4">
        <button
          onClick={logOut}
          className="border rounded-full px-6 py-2 border-gray-800 text-black font-bold bg-alt hover:bg-green-600 ease-linear transition-all"
        >
          Sign Out
        </button>
      </div>
      {children}
    </>
  );
};
