import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MuiSelect from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';

export default function Input({
    type = 'text',
    value,
    onChange,
    placeholder,
    label,
    id,
    disabled = false,
    error,
    icon,
    className = '',
    autoFocus = false,
    autoComplete = 'off',
    onKeyDown,
    sx = {},
    ...props
}) {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
        <Box className={`input-group ${className}`} sx={{ mb: 2, width: '100%' }}>
            <TextField
                id={inputId}
                type={type}
                label={label}
                value={value ?? ''}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                error={Boolean(error)}
                helperText={error}
                autoFocus={autoFocus}
                autoComplete={autoComplete}
                onKeyDown={onKeyDown}
                fullWidth
                variant="outlined"
                InputProps={{
                    startAdornment: icon ? (
                        <InputAdornment position="start" sx={{ ml: 1, mr: -0.5 }}>
                            <span style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>{icon}</span>
                        </InputAdornment>
                    ) : null,
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        direction: 'rtl',
                    },
                    '& .MuiInputBase-input': {
                        direction: 'rtl',
                        textAlign: 'start',
                    },
                    ...sx,
                }}
                {...props}
            />
        </Box>
    );
}

export function Textarea({
    value,
    onChange,
    placeholder,
    label,
    id,
    rows = 5,
    className = '',
    error,
    disabled = false,
    sx = {},
    ...props
}) {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2)}`;

    return (
        <Box className={`input-group ${className}`} sx={{ mb: 2, width: '100%' }}>
            <TextField
                id={textareaId}
                label={label}
                value={value ?? ''}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                multiline
                disabled={disabled}
                error={Boolean(error)}
                helperText={error}
                fullWidth
                variant="outlined"
                sx={{
                    '& .MuiInputBase-root': {
                        direction: 'rtl',
                    },
                    '& .MuiInputBase-input': {
                        direction: 'rtl',
                        textAlign: 'start',
                    },
                    ...sx,
                }}
                {...props}
            />
        </Box>
    );
}

export function Select({
    value,
    onChange,
    options = [],
    label,
    id,
    className = '',
    disabled = false,
    error,
    sx = {},
    ...props
}) {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`;
    const labelId = `${selectId}-label`;

    return (
        <Box className={`input-group ${className}`} sx={{ mb: 2, width: '100%' }}>
            <FormControl fullWidth variant="outlined" error={Boolean(error)} disabled={disabled} sx={sx}>
                {label && <InputLabel id={labelId}>{label}</InputLabel>}
                <MuiSelect
                    labelId={label ? labelId : undefined}
                    id={selectId}
                    value={value ?? ''}
                    onChange={onChange}
                    label={label}
                    sx={{
                        direction: 'rtl',
                        '& .MuiSelect-select': {
                            textAlign: 'right',
                        },
                    }}
                    {...props}
                >
                    {options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value} sx={{ direction: 'rtl', textAlign: 'right' }}>
                            {opt.label}
                        </MenuItem>
                    ))}
                </MuiSelect>
                {error && <FormHelperText>{error}</FormHelperText>}
            </FormControl>
        </Box>
    );
}
