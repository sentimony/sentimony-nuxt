<?php
/**
 * Шаблон подвала (footer.php)
 * @package WordPress
 * @subpackage your-clean-template
 */
?>

			</div><!-- /.row -->
		</div><!-- /.container -->
	</div><!-- /.wrapper -->

	<footer class="footer">
		<nav class="navbar navbar-default">
			<div class="container-fluid">

			<div style="float:left;line-height:50px;">NextClick 2014 - 2015 © Все права защищены</div>
				<?php $args = array( // arguments to display bottom menu, menu must be created in admin panel for arguments working
					'theme_location' => 'bottom', // menu identificator, defined of register_nav_menus() function in function.php
					'container'=> false, // parent tag of ul, false is nothing
					'menu_class' => 'nav navbar-nav navbar-right', // class of ul
					'menu_id' => 'bottom-nav', // id attribute of ul
				);
				wp_nav_menu($args); // display bottom menu
				?>
			</div>
		</div>
	</footer>

	</div><!-- /.main-wrap -->


<?php wp_footer(); // необходимо для работы плагинов и функционала  ?>

	<script src="<?php echo get_template_directory_uri(); ?>/js/jquery.min.js"></script>
	<script src="<?php echo get_template_directory_uri(); ?>/js/bootstrap.min.js"></script>

	<!-- Google Analytics -->
	<script>
		(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
		(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
		m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

		ga('create', 'UA-64108604-1', 'auto');
		ga('send', 'pageview');

	</script>
	<!-- End Google Analytics -->

</body>
</html>