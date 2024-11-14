export default {
  data() {
  return {
    isDropdownVisible: false,
  };
},
  methods: {
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    toggleView() {
      this.$router.push("/add-user");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    showChangePasswordForm() {
      this.$router.push("/pasword-admin");
    },
    viewUsers(){
      this.$router.push("/table-user");
    },
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
  },
};