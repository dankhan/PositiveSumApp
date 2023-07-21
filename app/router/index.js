// Start/Home
import Start from '~/components/pages/Start';
import Home from '~/components/pages/Home';

// Login Pages
import Login from '~/components/pages/Login/Login';
import ForgotPassword from '~/components/pages/Login/ForgotPassword';
import ForgotPasswordCheckEmail from '~/components/pages/Login/ForgotPasswordCheckEmail';
import ChangePassword from '~/components/pages/Login/ChangePassword';

// Sign Up pages
import SignUp from '~/components/pages/SignUp/SignUp';
import SignUpEmail from '~/components/pages/SignUp/SignUpEmail';
import SignUpCheckEmail from '~/components/pages/SignUp/SignUpCheckEmail';
import SignUpPassword from '~/components/pages/SignUp/SignUpPassword';
import SignUpPhone from '~/components/pages/SignUp/SignUpPhone';
import SignUpCheckPhone from '~/components/pages/SignUp/SignUpCheckPhone';

// Check-In Pages
import CheckInHome from '~/components/pages/CheckIn/CheckInHome';

// Help Pages
import ForgotPasswordHelp from '~/components/pages/Help/Login/ForgotPasswordHelp';
import SignUpHelp from '~/components/pages/Help/SignUp/SignUpHelp';

// Setup the router links
const router = {
  start: Start,
  home: Home,
  
  // Login pages
  login: Login,
  forgotPassword: ForgotPassword,
  forgotPasswordCheckEmail: ForgotPasswordCheckEmail,
  changePassword: ChangePassword,

  // Sign Up pages
  signUp: SignUp,
  signUpEmail: SignUpEmail,
  signUpCheckEmail: SignUpCheckEmail,
  signUpPassword: SignUpPassword,
  signUpPhone: SignUpPhone,
  signUpCheckPhone: SignUpCheckPhone,

  // CHeck-In pages
  checkInHome: CheckInHome,

  // Help pages
  forgotPasswordHelp: ForgotPasswordHelp,
  signUpHelp: SignUpHelp,
}

export default router;