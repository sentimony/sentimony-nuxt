<?php
/**
 * Шаблон обычной страницы (page.php)
 * @package WordPress
 * @subpackage your-clean-template
 */
get_header(); // подключаем header.php ?>
<div class="col-sm-8">
  <section>
  <?php if ( have_posts() ) while ( have_posts() ) : the_post(); // старт цикла ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>> <?php // контэйнер с классами и id ?>
      <h1><?php the_title(); // заголовок ?></h1>
      <?php the_content(); // контент ?>
    </article>
  <?php endwhile; // конец цикла ?>
  </section>
</div>
<?php get_sidebar(); // подключаем sidebar.php ?>
<?php get_footer(); // подключаем footer.php ?>