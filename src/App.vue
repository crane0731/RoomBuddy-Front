<template>
  <div id="app">
    <Header />   <!-- ✅ 모든 페이지에 고정 -->
    <main class="main-content">
      <router-view />  <!-- ✅ 페이지별 내용 -->
    </main>
    <Footer />   <!-- ✅ 모든 페이지에 고정 -->
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<style>
.main-content {
  padding-top: 60px;   /* 헤더 높이 */
  padding-bottom: 55px;/* ✅ 푸터 높이만큼만 띄움 */
}
</style>


