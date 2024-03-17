from setuptools import setup, find_packages

long_description = open("README.rst").read()

setup(
    name="django-horseman",
    version="0.1",
    description="A simple headless CMS for Django",
    long_description=long_description,
    author="Walker Angell",
    author_email="w@lker.co",
    url="https://github.com/walkness/django-horseman",
    package_data={"horseman.horsemanadmin": ["templates/**/*", "frontend/dist/**/*"]},
    classifiers=[],
    license="MIT",
    platforms=["any"],
)
