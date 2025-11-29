<script>
export default {
  onLaunch() {
    try {
      const token = (typeof uni !== 'undefined' && uni.getStorageSync) ? uni.getStorageSync('auth_token') : null;
      const target = token ? '/pages/system/index' : '/pages/index/index';
      setTimeout(() => { try { uni.reLaunch({ url: target }); } catch (_) {} }, 0);
    } catch (e) {
      try { uni.reLaunch({ url: '/pages/index/index' }); } catch (_) {}
    }
  },
  onShow() {},
  onHide() {},
}
</script>

<style>
/*每个页面公共css */
</style>
