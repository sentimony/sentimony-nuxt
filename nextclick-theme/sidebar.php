<?php
/**
 * Шаблон сайдбара (sidebar.php)
 * @package WordPress
 * @subpackage your-clean-template
 */
?>
<div class="col-sm-4">
  <aside>
  <?php dynamic_sidebar('left-sidebar'); // выводим сайдбар, имя определено в function.php ?>
  </aside>
</div>
