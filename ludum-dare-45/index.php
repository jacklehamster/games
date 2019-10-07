<?php

   $dir    = 'assets';
   $assets = scandir($dir);

   $asset_array = [];

    foreach ($assets as $file) {
    	if (is_file("$dir/$file")) {
        list($width, $height) = getimagesize("$dir/$file");
        list($name, $ext) = explode('.', $file);
        $asset_array[$name] = [
            'path' => "$dir/$file",
            'extension' => $ext,
            'filename' => $file,
            'filesize' => filesize("$dir/$file"),
            'width' => $width,
            'height' => $height,
        ];
    	}
    }
    $source = json_encode($asset_array, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT);
    file_put_contents("generated/assets.js", "const files = $source;");
    readfile("index.html");
?>