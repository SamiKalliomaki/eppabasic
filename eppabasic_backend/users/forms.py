from django.forms import Form, ModelForm, CharField, EmailField, RegexField, PasswordInput, ValidationError
from django.utils.translation import ugettext, ugettext_lazy as _
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from users.models import CustomUser

class RegistrationForm(ModelForm):
    error_messages = {
        'duplicate_username': _('A user with that username already exists.'),
        'duplicate_email': _('A user with that email already exists.'),
        'password_mismatch': _("The two password fields didn't match."),
    }

    username = RegexField(
        max_length=16, regex=r'^[\w.@+-]+$',
        error_messages={
            'invalid': _('This value may contain only letters, numbers and @/./+/-/_ characters.')
        }
    )

    password1 = CharField(max_length=255)
    password2 = CharField(max_length=255)

    class Meta:
        model = CustomUser
        fields = ('username', 'email')

    def clean_username(self):
        username = self.cleaned_data['username']
        try:
            CustomUser._default_manager.get(username=username)
        except CustomUser.DoesNotExist:
            return username
        raise ValidationError(
            self.error_messages['duplicate_username'],
            code='duplicate_username',
        )

    def clean_email(self):
        email = self.cleaned_data['email']
        try:
            CustomUser._default_manager.get(email=email)
        except CustomUser.DoesNotExist:
            return email
        raise ValidationError(
            self.error_messages['duplicate_email'],
            code='duplicate_email',
        )

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )
        return password2

    def save(self, commit=True):
        user = super(RegistrationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user


class CustomUserChangeForm(ModelForm):
    username = RegexField(
        label=_('Username'), max_length=30, regex=r'^[\w.@+-]+$',
        help_text=_('Required. 30 characters or fewer. Letters, digits and '
                      '@/./+/-/_ only.'),
        error_messages={
            'invalid': _('This value may contain only letters, numbers and '
                         '@/./+/-/_ characters.')})
    password = ReadOnlyPasswordHashField(label=_('Password'),
        help_text=_('Raw passwords are not stored, so there is no way to see '
                    "this user's password, but you can change the password "
                    'using <a href=\'password/\'>this form</a>.'))

    class Meta:
        model = CustomUser
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super(CustomUserChangeForm, self).__init__(*args, **kwargs)
        f = self.fields.get('user_permissions', None)
        if f is not None:
            f.queryset = f.queryset.select_related('content_type')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial['password']

class CustomUserCreationForm(ModelForm):
    '''
    A form that creates a user, with no privileges, from the given username and
    password.
    '''
    error_messages = {
        'duplicate_username': _('A user with that username already exists.'),
        'password_mismatch': _("The two password fields didn't match."),
    }
    username = RegexField(label=_('Username'), max_length=30,
        regex=r'^[\w.@+-]+$',
        help_text=_('Required. 30 characters or fewer. Letters, digits and '
                      '@/./+/-/_ only.'),
        error_messages={
            'invalid': _('This value may contain only letters, numbers and '
                         '@/./+/-/_ characters.')})
    password1 = CharField(label=_('Password'),
        widget=PasswordInput)
    password2 = CharField(label=_('Password confirmation'),
        widget=PasswordInput,
        help_text=_('Enter the same password as above, for verification.'))

    class Meta:
        model = CustomUser
        fields = ('username',)

    def clean_username(self):
        # Since CustomUser.username is unique, this check is redundant,
        # but it sets a nicer error message than the ORM. See #13147.
        username = self.cleaned_data['username']
        try:
            CustomUser._default_manager.get(username=username)
        except CustomUser.DoesNotExist:
            return username
        raise ValidationError(
            self.error_messages['duplicate_username'],
            code='duplicate_username',
        )

    def clean_password2(self):
        password1 = self.cleaned_data.get('password1')
        password2 = self.cleaned_data.get('password2')
        if password1 and password2 and password1 != password2:
            raise ValidationError(
                self.error_messages['password_mismatch'],
                code='password_mismatch',
            )
        return password2

    def save(self, commit=True):
        user = super(CustomUserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password1'])
        if commit:
            user.save()
        return user