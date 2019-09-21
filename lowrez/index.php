<?php


   $dir    = 'ASSETS';
   $assets = scandir($dir);

   $asset_source = "";

    $asset_source .= "const FILE_SIZE = {\n";
    foreach ($assets as $file) {
    	if (is_file("$dir/$file")) {
    		$size = filesize("$dir/$file");
    		$asset_source .= "   '$file' : $size,\n";
    	}
    }
    $asset_source .= "};";

    file_put_contents("asset-size.js", $asset_source);

	readfile("index.html");
?>