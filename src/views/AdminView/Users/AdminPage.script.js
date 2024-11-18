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
      this.$router.push("admin/add-user");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    viewStock(){
      this.$router.push("admin/view-product");
    },
    showChangePasswordForm() {
      this.$router.push("admin/pasword");
    },
    viewUsers(){
      this.$router.push("admin/table-user");
    },
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
  },
};