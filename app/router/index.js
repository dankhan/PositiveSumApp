// Start/Home
import Start from '~/components/pages/Start';
import Home from '~/components/pages/Home';

// Login Pages
import Login from '~/components/pages/Login/Login';
import ForgotPassword from '~/components/pages/Login/ForgotPassword';
import ForgotPasswordCheckEmail from '~/components/pages/Login/ForgotPasswordCheckEmail';
import ChangePassword from '~/components/pages/Login/ChangePassword';

// Help Pages
import ForgotPasswordHelp from '~/components/pages/Help/Login/ForgotPasswordHelp';

// Setup the router links
const router = {
  start: Start,
  home: Home,
  
  // Login pages
  login: Login,
  forgotPassword: ForgotPassword,
  forgotPasswordCheckEmail: ForgotPasswordCheckEmail,
  changePassword: ChangePassword,

  // Help pages
  forgotPasswordHelp: ForgotPasswordHelp,
}

export default router;