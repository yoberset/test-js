<?php

header('Content-type: application/json');

if (!empty($_GET['url'])) {
	$url = urldecode($_GET['url']);

	$json = file_get_contents($url);

	if ($json) {
		echo $json;
	}
}