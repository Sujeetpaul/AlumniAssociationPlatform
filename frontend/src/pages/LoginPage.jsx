    // src/pages/LoginPage.jsx
    import { Link } from 'react-router-dom';
    import LoginForm from '../features/auth/components/LoginForm';

    function LoginPage() {
      return (
        // AuthLayout provides centering and background
        <> {/* Use Fragment */}
            <LoginForm />
            {/* Add link to college registration */}
            <p className="text-center text-sm text-gray-600 mt-6">
                Want to register your college?{' '}
                <Link to="/register/college" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Register here
                </Link>
            </p>
            {/* Add link for student/alumni signup later */}
            {/* <p className="text-center text-sm text-gray-600 mt-2">
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Sign up
                </Link>
            </p> */}
        </>
      );
    }

    export default LoginPage;
    