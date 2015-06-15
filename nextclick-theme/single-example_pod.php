<?php
/**
 * Шаблон отдельной записи (single.php)
 * @package WordPress
 * @subpackage your-clean-template
 */
get_header(); // подключаем header.php ?>
<div class="col-sm-8">
  <section>
  <?php if ( have_posts() ) while ( have_posts() ) : the_post(); // старт цикла ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>> <?php // контэйнер с классами и id ?>
          <?php if ( has_post_thumbnail() ) {
            the_post_thumbnail( 'big-thumb' );
          } ?>
      <h1><?php the_title(); // заголовок поста ?></h1>
      <!-- <div class="meta">
        <p>Опубликовано: <?php the_time('F j, Y'); ?> в <?php the_time('g:i a'); ?></p> <?php // дата и время создания ?>
        <p>Категории: <?php the_category(',') ?></p> <?php // ссылки на категории в которых опубликован пост, через зпт ?>
        <?php the_tags('<p>Тэги: ', ',', '</p>'); // ссылки на тэги поста ?>
      </div> -->
      <?php the_content(); // контент ?>
    </article>
  <?php endwhile; // конец цикла ?>
  <?php previous_post_link('%link', '<- Предыдущий пост: %title', TRUE); // ссылка на предыдущий пост ?> 
  <?php next_post_link('%link', 'Следующий пост: %title ->', TRUE); // ссылка на следующий пост ?> 
  <?php if (comments_open() || get_comments_number()) comments_template('', true); // если комментирование открыто - мы покажем список комментариев и форму, если закрыто, но кол-во комментов > 0 - покажем только список комментариев ?>

    <script type="text/javascript" data-key="B08F-4F30-043A-095C-1YfnPD">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['B08F-4F30-043A-095C-1YfnPD', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="7A74-E18D-DDEB-2BF4-1YfnPm">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['7A74-E18D-DDEB-2BF4-1YfnPm', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="77E2-38FB-B81D-01BC-1YfnPz">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['77E2-38FB-B81D-01BC-1YfnPz', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="52D5-2B9E-EA46-6B31-1YfnQE">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['52D5-2B9E-EA46-6B31-1YfnQE', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="556C-9ED7-7BCD-9638-1YfnQU">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['556C-9ED7-7BCD-9638-1YfnQU', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="3A73-1F23-3C50-A52E-1YfnQi">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['3A73-1F23-3C50-A52E-1YfnQi', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="1E8A-E5A1-171F-9A40-1YfnQs">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['1E8A-E5A1-171F-9A40-1YfnQs', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="B0FA-FC39-960C-7C09-1YfnR6">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['B0FA-FC39-960C-7C09-1YfnR6', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="8E13-C8DB-B310-102B-1YfnRN">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;

      __nc_widgets.push(['8E13-C8DB-B310-102B-1YfnRN', 'nextclick.com.ua', 'recommendation', 1, 0, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

    <script type="text/javascript" data-key="DC4E-268F-F51C-2E16-1YaMGN">
      var __nc_widgets = __nc_widgets || [];
      var __nc_j = __nc_j || null;
      var __nc_page_created_at = "<? echo get_the_time('Y-n-j g:i:s'); ?>";

      __nc_widgets.push(['DC4E-268F-F51C-2E16-1YaMGN', 'nextclick.com.ua', 'recommendation', 1, 1, 0, 'ua']);

      (function() {
        var __nc = document.createElement('script'); __nc.type = 'text/javascript'; __nc.async = true; __nc.id = 'Nextclick_Manager';
        __nc.src = 'http://nextclick.com.ua/widget/widget.recommendation.1.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(__nc, s);
      })();
    </script>

  </section>
</div>
<?php get_sidebar(); // подключаем sidebar.php ?>
<?php get_footer(); // подключаем footer.php ?>
