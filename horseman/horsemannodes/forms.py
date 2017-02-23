from django import forms

class RichTextFormField(forms.CharField):
    widget = forms.Textarea
