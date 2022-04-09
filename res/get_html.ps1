Add-Type -AssemblyName System.Windows.Forms

$dataObject = [System.Windows.Forms.Clipboard]::GetDataObject()
if ($dataObject.GetDataPresent([System.Windows.Forms.DataFormats]::Html)) {
  # Ref: http://shen7113.blog.fc2.com/blog-entry-7.html
  $bytesData = $dataObject.GetData("Html Format").ToArray()
  [Console]::WriteLine([System.Convert]::ToBase64String($bytesData))
}
else {
  Exit 1
}
