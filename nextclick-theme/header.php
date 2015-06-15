<?php
/**
 * Шаблон шапки (header.php)
 * @package WordPress
 * @subpackage your-clean-template
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); // вывод атрибутов языка ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); // кодировка ?>">
  <?php /* RSS и всякое */ ?>
  <link rel="alternate" type="application/rdf+xml" title="RDF mapping" href="<?php bloginfo('rdf_url'); ?>">
  <link rel="alternate" type="application/rss+xml" title="RSS" href="<?php bloginfo('rss_url'); ?>">
  <link rel="alternate" type="application/rss+xml" title="Comments RSS" href="<?php bloginfo('comments_rss2_url'); ?>">
  <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
  <link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/css/bootstrap.min.css">
  <link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/style.css">
   <!--[if lt IE 9]>
   <script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
   <![endif]-->
  <title><?php typical_title(); // выводи тайтл, функция лежит в function.php ?></title>
  <?php wp_head(); // необходимо для работы плагинов и функционала ?>
</head>
<body <?php body_class(); // все классы для body ?>>
  <div class="main-wrap">

  <header class="header">
    <nav class="navbar navbar-default">
      <div class="container-fluid">

      <?php $args = array( // arguments to display top menu, menu must be created in admin panel for arguments working
        'theme_location' => 'top', // menu identificator, defined of register_nav_menus() function in function.php
        'container'=> 'nav', // parent tag of ul, false is nothing
        'menu_class' => 'nav navbar-nav', // class of ul
        'menu_id' => 'top-nav', // id attribute of ul
        );
        wp_nav_menu($args); // display top menu
      ?>

      </div>
    </nav>
  </header>

  <div class="wrapper">
    <div class="container">
      <div class="row">
