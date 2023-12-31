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
import CheckInReplyUser from '~/components/pages/CheckIn/CheckInReplyUser';
import CheckInGroup from '~/components/pages/CheckIn/CheckInGroup';
import YourCheckIns from '~/components/pages/CheckIn/YourCheckIns';
import CheckIn from '~/components/pages/CheckIn/CheckIn';

// Person Pages
import AddPerson from '~/components/pages/Person/AddPerson';
import ViewPerson from '~/components/pages/Person/ViewPerson';

// Group Pages
import AddGroup from '~/components/pages/Group/AddGroup';

// Help Pages
import ForgotPasswordHelp from '~/components/pages/Help/Login/ForgotPasswordHelp';
import SignUpHelp from '~/components/pages/Help/SignUp/SignUpHelp';
import CheckInHomeHelp from '~/components/pages/Help/CheckIn/CheckInHomeHelp';
import CheckInHelp from '~/components/pages/Help/CheckIn/CheckInHelp';
import YourCheckInsHelp from '~/components/pages/Help/CheckIn/YourCheckInsHelp';
import AddPersonHelp from '~/components/pages/Help/Person/addPersonHelp';
import AddGroupHelp from '~/components/pages/Help/Group/addGroupHelp';

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

  // Check-In pages
  checkInHome: CheckInHome,
  checkInReplyUser: CheckInReplyUser,
  checkInGroup: CheckInGroup,
  yourCheckIns: YourCheckIns,
  checkIn: CheckIn,

  // Person pages
  addPerson: AddPerson,
  viewPerson: ViewPerson,

  // Group pages
  addGroup: AddGroup,
  
  // Help pages
  forgotPasswordHelp: ForgotPasswordHelp,
  signUpHelp: SignUpHelp,
  checkInHomeHelp: CheckInHomeHelp,
  checkInHelp: CheckInHelp,
  yourCheckInsHelp: YourCheckInsHelp,
  addPersonHelp: AddPersonHelp,
  addGroupHelp: AddGroupHelp,
}

export default router;