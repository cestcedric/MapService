<template>
  <VApp
    id="app"
    dark
  >
    <!-- <div id="nav">
      <RouterLink to="/">
        Home
      </RouterLink> |
      <RouterLink to="/map">
        Map
      </RouterLink>
    </div> -->
    <RouterView />
  </VApp>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
#nav {
  padding: 30px;
  // a {
  //   font-weight: bold;
  //   color: #2c3e50;
  //   &.router-link-exact-active {
  //     color: #42b983;
  //   }
  // }
}
</style>
